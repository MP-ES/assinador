import * as graphene from 'graphene-pk11';
import rfc5280 from 'asn1.js-rfc5280';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import getLibs from './getLibs';

const getSubjectIcpBrasil = buffer => {
  const cert = rfc5280.Certificate.decode(buffer, 'der');
  const extensions = get(cert, 'tbsCertificate.extensions', []);
  const subject = extensions.filter(
    item => item.extnID === 'subjectAlternativeName'
  );
  return subject;
};

const getCertificates = () => {
  const certificates = [];
  const libs = getLibs();
  libs.forEach(lib => {
    const mod = graphene.Module.load(lib);
    mod.initialize();
    const slots = mod.getSlots(true);
    for (let i = 0; i < slots.length; i++) {
      const slot = mod.getSlots(i);
      const session = slot.open();
      const certs = session.find({ class: graphene.ObjectClass.CERTIFICATE });
      for (let j = 0; j < certs.length; j++) {
        const cert = certs.items(j);
        const subject = getSubjectIcpBrasil(cert.getAttribute('value'));
        if (!isEmpty(subject))
          certificates.push({
            displayName: cert.getAttribute('label').toString('utf8'),
            id: cert.getAttribute('id').toString('hex'),
            libraryPath: lib,
            slotId: i
          });
      }
    }
    mod.finalize();
  });
  return certificates;
};

export default getCertificates;
