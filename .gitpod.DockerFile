FROM gitpod/workspace-full:latest

RUN bash -c ". /home/gitpod/.sdkman/bin/sdkman-init.sh \
             && sdk install java 8.0.275.open-adpt"

RUN bash -c ". .nvm/nvm.sh \
    && nvm install 12 \
    && nvm use 12 \
    && nvm alias default 12"

RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix 
