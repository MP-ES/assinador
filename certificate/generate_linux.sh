openssl req -x509 -nodes -new -sha256 -days 36500 -newkey rsa:2048 -keyout RootCA.key -out RootCA.pem -subj "/C=BR/CN=MPES-assinador-Root"
openssl x509 -outform pem -in RootCA.pem -out RootCA.crt
openssl req -new -nodes -newkey rsa:2048 -keyout localhost.key -out localhost.csr -subj "/C=BR/ST=Espirito Santo/L=Vitoria/O=MPES/CN=localhost"
openssl x509 -req -sha256 -days 36500 -in localhost.csr -CA RootCA.pem -CAkey RootCA.key -CAcreateserial -extfile domains.ext -out localhost.crt
openssl pkcs12 -export -out localhost.pfx -inkey localhost.key -in localhost.crt