import * as graphene from 'graphene-pk11';

const sign = (lib, slotId, password, certId, hash) => {
  let signature = '';
  const mod = graphene.Module.load(lib);
  try {
    mod.initialize();
    const slot = mod.getSlots(slotId);
    if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
      const session = slot.open();
      session.login(password);
      const sign = session.createSign(
        'SHA256_RSA_PKCS',
        session
          .find({ class: graphene.ObjectClass.PRIVATE_KEY, id: certId })
          .items(0)
      );
      sign.update(hash);
      signature = sign.final();
      session.logout();
    }
  } finally {
    mod.finalize();
  }
  return signature.toString('base64');
};

const getSignCertificate = (lib, slotId, certId) => {
  let certificate = '';
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
  } finally {
    mod.finalize();
  }
  return certificate;
};

const getAllCertificates = (lib, slotId) => {
  const certificates = [];
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
  } finally {
    mod.finalize();
  }
  return certificates;
};

export default { sign, getSignCertificate, getAllCertificates };
