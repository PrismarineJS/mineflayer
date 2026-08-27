import java.lang.classfile.ClassFile;
import java.lang.classfile.ClassModel;
import java.lang.classfile.Label;
import java.lang.classfile.MethodModel;
import java.lang.constant.ClassDesc;
import java.lang.constant.ConstantDescs;
import java.lang.constant.MethodTypeDesc;
import java.lang.instrument.ClassFileTransformer;
import java.lang.instrument.Instrumentation;
import java.security.ProtectionDomain;

/**
 * Netty 4.1.x: AbstractNioChannel.clearReadPending0() is queued onto the event
 * loop by setAutoRead(false) and drops OP_READ unconditionally when it runs.
 * If autoRead has been switched back on in between, the channel is left with
 * autoRead=true and no read interest, and nothing ever re-arms it. Rewrites the
 * method to leave OP_READ alone when autoRead is already true:
 *
 *   readPending = false;
 *   if (!config().isAutoRead()) ((AbstractNioUnsafe) unsafe()).removeReadOp();
 */
public class NettyAutoReadFixAgent {
  static final String TARGET = "io/netty/channel/nio/AbstractNioChannel";
  static final ClassDesc CHANNEL = ClassDesc.ofInternalName(TARGET);
  static final ClassDesc NIO_UNSAFE = ClassDesc.ofInternalName(TARGET + "$AbstractNioUnsafe");
  static final ClassDesc UNSAFE = ClassDesc.ofInternalName("io/netty/channel/Channel$Unsafe");
  static final ClassDesc CONFIG = ClassDesc.ofInternalName("io/netty/channel/ChannelConfig");

  public static void premain(String args, Instrumentation inst) {
    inst.addTransformer(new ClassFileTransformer() {
      public byte[] transform(ClassLoader loader, String name, Class<?> cls, ProtectionDomain pd, byte[] bytes) {
        if (!TARGET.equals(name)) return null;
        try {
          return patch(bytes);
        } catch (Throwable t) {
          System.err.println("netty-autoread-fix: leaving " + name + " unpatched: " + t);
          return null;
        }
      }
    });
  }

  static byte[] patch(byte[] bytes) {
    ClassFile cf = ClassFile.of();
    ClassModel cm = cf.parse(bytes);
    boolean[] patched = { false };
    byte[] out = cf.transformClass(cm, (cb, ce) -> {
      if (ce instanceof MethodModel mm && mm.methodName().equalsString("clearReadPending0")) {
        patched[0] = true;
        cb.withMethod(mm.methodName(), mm.methodType(), mm.flags().flagsMask(), mb -> mb.withCode(code -> {
          Label done = code.newLabel();
          code.aload(0).iconst_0().putfield(CHANNEL, "readPending", ConstantDescs.CD_boolean)
              .aload(0).invokevirtual(CHANNEL, "config", MethodTypeDesc.of(CONFIG))
              .invokeinterface(CONFIG, "isAutoRead", MethodTypeDesc.of(ConstantDescs.CD_boolean))
              .ifne(done)
              .aload(0).invokevirtual(CHANNEL, "unsafe", MethodTypeDesc.of(UNSAFE))
              .checkcast(NIO_UNSAFE).invokevirtual(NIO_UNSAFE, "removeReadOp", MethodTypeDesc.of(ConstantDescs.CD_void))
              .labelBinding(done).return_();
        }));
      } else {
        cb.with(ce);
      }
    });
    System.err.println("netty-autoread-fix: " + (patched[0] ? "patched" : "no clearReadPending0 in") + " " + TARGET);
    return patched[0] ? out : null;
  }
}
