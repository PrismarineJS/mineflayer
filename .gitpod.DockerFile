FROM gitpod/workspace-full:latest

# Install OpenJDK-8
RUN apt-get update && \
    apt-get install -y openjdk-8-jdk && \
    apt-get install -y ant && \
    apt-get clean;

# Fix certificate issues
RUN apt-get update && \
    apt-get install ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f;

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

RUN bash -c ". .nvm/nvm.sh \
    && nvm install 14 \
    && nvm use 14 \
    && nvm alias default 14"

RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix 
