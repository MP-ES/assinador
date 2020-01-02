import * as graphene from 'graphene-pk11';
import rfc5280 from 'asn1.js-rfc5280';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';
import moment from 'moment';

import getLibs from './getLibs';

moment.locale('pt-BR');

const getSubjectIcpBrasil = cert => {
  const extensions = get(cert, 'tbsCertificate.extensions', []);
  const subject = extensions.filter(
    item => get(item, 'extnID', '') === 'subjectAlternativeName'
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
        const { id, label, value } = cert.getAttribute({
          label: null,
          id: null,
          value: null
        });
        const x509 = rfc5280.Certificate.decode(value, 'der');
        const subject = getSubjectIcpBrasil(x509);
        if (!isEmpty(subject)) {
          const { notAfter, notBefore } = get(
            x509,
            'tbsCertificate.validity',
            {}
          );
          const after = moment.utc(notAfter.value);
          const before = moment.utc(notBefore.value);
          const now = moment.utc();
          const localDate = after.local().format('DD/MM/YYYY');
          certificates.push({
            id: id.toString('hex'),
            displayName: `${label} ${localDate}`,
            valid: before.isBefore(now) && after.isAfter(now),
            libraryPath: lib,
            slotId: i
          });
        }
      }
    }
    mod.finalize();
  });
  return sortBy(certificates, ['displayName', 'valid']);
};

export default getCertificates;
