import * as graphene from 'graphene-pk11';

const sign = (lib, slotId, password, certId, hash) => {
  let signature = '';
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
        session.logout();
      }
    } catch (error) {
      console.log(error);
    } finally {
      mod.finalize();
    }
  } catch (error) {
    console.log(`falha ao carregar lib: ${lib}`);
  }
  return signature.toString('base64');
};

const getSignCertificate = (lib, slotId, certId) => {
  let certificate = '';
  try {
    const mod = graphene.Module.load(lib);
    try {
      mod.initialize();
      const slot = mod.getSlots(slotId);
      if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
        const session = slot.open();
        const certs = session.find({
          class: graphene.ObjectClass.CERTIFICATE,
          certType: graphene.CertificateType.X_509,
          id: certId
        });
        for (let i = 0; i < certs.length; i++) {
          const cert = certs.items(i);
          certificate = cert.getAttribute('value').toString('base64');
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      mod.finalize();
    }
  } catch (error) {
    console.log(`falha ao carregar lib: ${lib}`);
  }
  return certificate;
};

const getAllCertificates = (lib, slotId) => {
  const certificates = [];
  try {
    const mod = graphene.Module.load(lib);
    try {
      mod.initialize();
      const slot = mod.getSlots(slotId);
      if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
        const session = slot.open();
        const certs = session.find({
          class: graphene.ObjectClass.CERTIFICATE,
          certType: graphene.CertificateType.X_509
        });
        for (let i = 0; i < certs.length; i++) {
          const cert = certs.items(i);
          certificates.push(cert.getAttribute('value').toString('base64'));
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      mod.finalize();
    }
  } catch (error) {
    console.log(`falha ao carregar lib: ${lib}`);
  }
  return certificates;
};

export default { sign, getSignCertificate, getAllCertificates };
