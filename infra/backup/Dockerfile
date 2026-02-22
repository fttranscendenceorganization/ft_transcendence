FROM postgres:17-alpine

RUN apk add --no-cache \
    postgresql-client \
    bash \
    gzip \
    tzdata

WORKDIR /backup

COPY backup.sh .
RUN chmod +x backup.sh

CMD ["./backup.sh"]