openssl genrsa -des3 -out localhost.key 1024
openssl req -new -key localhost.key -out localhost.csr -subj "/C=BR/ST=Espirito Santo/L=Vitoria/O=MPES/CN=localhost"
openssl x509 -req -days 10240 -in localhost.csr -signkey localhost.key -out localhost.crt -extfile domains.ext 
openssl pkcs12 -export -out localhost.pfx -inkey localhost.key -in localhost.crt