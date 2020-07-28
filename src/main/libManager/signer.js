import * as graphene from 'graphene-pk11';

export default function sign(lib, slotId, password, certId, hash) {
  let signature = '';
  let certificate = '';
  const certificates = [];
  try {
    const mod = graphene.Module.load(lib);
    try {
      mod.initialize();
      const slot = mod.getSlots(slotId);
      if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
        const session = slot.open();
        session.login(password);
        const sign = session.createSign(
          graphene.MechanismEnum.SHA256_RSA_PKCS,
          session
            .find({ class: graphene.ObjectClass.PRIVATE_KEY, id: certId })
            .items(0)
        );
        sign.update(hash);
        signature = sign.final();
        const signCerts = session.find({
          class: graphene.ObjectClass.CERTIFICATE,
          certType: graphene.CertificateType.X_509,
          id: certId
        });
        for (let i = 0; i < signCerts.length; i++) {
          const cert = signCerts.items(i);
          certificate = cert.getAttribute('value').toString('base64');
        }
        const allCerts = session.find({
          class: graphene.ObjectClass.CERTIFICATE,
          certType: graphene.CertificateType.X_509
        });
        for (let i = 0; i < allCerts.length; i++) {
          const cert = allCerts.items(i);
          certificates.push(cert.getAttribute('value').toString('base64'));
        }
        session.logout();
        session.close();
      }
      slot.closeAll();
    } catch (error) {
      console.log(error);
    } finally {
      mod.close();
    }
  } catch (error) {
    console.log(`falha ao carregar lib: ${lib}`);
  }
  return {
    signature: signature.toString('base64'),
    signCertificate: certificate,
    otherCertificates: certificates
  };
}
