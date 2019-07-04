# !/bin/bash/
cp local.crt /etc/pki/ca-trust/source/anchors/local.crt
chmod 0744 /etc/pki/ca-trust/source/anchors/local.crt
update-ca-trust