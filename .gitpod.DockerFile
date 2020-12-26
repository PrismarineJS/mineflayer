FROM gitpod/workspace-full:latest

RUN bash -c ". /home/gitpod/.sdkman/bin/sdkman-init.sh \
             && sdk install java 8.0.275.open-adpt"

RUN bash -c ". .nvm/nvm.sh \
    && nvm install 14 \
    && nvm use 14 \
    && nvm alias default 14"

RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix 
