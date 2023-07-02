FROM registry.access.redhat.com/ubi8/ubi-minimal:8.6

# Repo https://github.com/cmwylie19/gitops-helpers

ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en'
RUN microdnf install bash dnf gzip wget tar\
    && microdnf update \
    && microdnf clean all 

ARG OCP_VERSION=4.10.45
ARG USERNAME=readfile
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME

RUN wget https://github.com/fullstorydev/grpcurl/releases/download/v1.8.7/grpcurl_1.8.7_linux_x86_64.tar.gz \
    && tar -xzf grpcurl_1.8.7_linux_x86_64.tar.gz -C /usr/bin \
    && rm -rf grpcurl_1.8.7_linux_x86_64.tar.gz

RUN dnf install openssl jq -y

USER $USERNAME

WORKDIR /home/$USERNAME

CMD ["/bin/sleep","9999"]