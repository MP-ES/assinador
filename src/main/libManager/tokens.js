// https://github.com/pablo-moreira/jsign/blob/53d04b547a4aa4aebba41dfae60fbe52ef98f938/src/main/java/com/github/jsign/model/PKCS11Tokens.java
/* global __static */
import path from 'path';

const libPath = path.join(__static, 'libs');

const tokens = {
  win: {
    ePass2003: ['eps2003csp11.dll', path.join(libPath, 'eps2003csp11.dll')],
    eToken: [
      path.join(libPath, 'eToken.dll'),
      'eTPKCS11.dll',
      'c:/windows/system32/eTPKCS11.dll'
    ],
    OpenSC: ['c:/windows/system32/opensc-pkcs11.dll'],
    AET: [
      path.join(libPath, 'aetpkss1.dll'),
      'aetpkcss1.dll',
      'c:/windows/system32/aetpkss1.dll'
    ],
    GCLIB: ['gclib.dll'],
    PK2PRIV: ['pk2priv.dll'],
    W32PK2IG: ['w32pk2ig.dll'],
    NGP11V211: ['ngp11v211.dll'],
    ACOSPKCS11: ['ngp11v211.dll'],
    DKCK201: ['dkck201.dll'],
    DKCK232: ['dkck232.dll'],
    CRYPTOKI22: ['cryptoki22.dll'],
    ACPKCS: ['acpkcs.dll'],
    SLBCK: ['slbck.dll'],
    CMP11: ['cmP11.dll'],
    WDPKCS: [
      'WDPKCS.dll',
      'C:/Windows/System32/Watchdata/Watchdata Brazil CSP v1.0/WDPKCS.dll'
    ]
  },
  mac: {
    eToken: [
      '/Library/Frameworks/eToken.framework/Versions/4.55.41/libeToken.dylib',
      '/usr/local/lib/libeTPkcs11.dylib',
      '/Library/Frameworks/eToken.framework/Versions/Current/libeToken.dylib'
    ],
    WDPKCS: ['libwdpkcs.dylib', '/usr/local/lib/libwdpkcs.dylib']
  },
  linux: {
    ePass2003: [
      'libcastle.so.1.0.0',
      'libcastle.so',
      path.join(libPath, 'libcastle.so')
    ],
    eToken: [
      path.join(libPath, 'libeToken.so'),
      '/lib/libeToken.so.8',
      '/lib/libeToken.so.8.0',
      '/lib64/libeToken.so.8',
      '/lib64/libeToken.so.8.0',
      'libeTPkcs11.so',
      'libeToken.so'
    ],
    OpenSC: [
      '/lib/opensc-pkcs11.so',
      '/usr/lib/pkcs11/opensc-pkcs11.so',
      '/usr/lib/opensc-pkcs11.so'
    ],
    AETUNX: ['/lib/libaetpkss.so', 'libaetpkss.so'],
    CMP11: ['libcmP11.so', '/lib/libcmP11.so'],
    WDPKCS: [
      'libwdpkcs.so',
      '/lib/libwdpkcs.so',
      '/usr/local/lib64/libwdpkcs.so',
      '/usr/local/lib/libwdpkcs.so',
      '/usr/lib/watchdata/lib/libwdpkcs.so',
      '/opt/watchdata/lib64/libwdpkcs.so'
    ],
    GPKCS11: ['libgpkcs11.so', 'libgpkcs11.so.2'],
    EPSNG: [
      'libepsng_p11.so',
      'libepsng_p11.so.1',
      '/usr/local/ngsrv/libepsng_p11.so.1'
    ]
  }
};

export default tokens;
