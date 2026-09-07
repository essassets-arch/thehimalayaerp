const bcrypt = require('bcryptjs');

const hashBrowser = '$2b$12$NKBiwSn/ukVHJqeNVP4s8.1e3cXjlCSNO3Bg/5V.g1JMkr16GBCcS';
const hashMain = '$2b$10$938wEpQ5Kv6s0z9T14lx5.QsccEizi5UdXr.CpzSqp4jTV7Uc95XO';

(async () => {
  const matchB1 = await bcrypt.compare('supersales123', hashBrowser);
  const matchB2 = await bcrypt.compare('admin123', hashBrowser);
  const matchM1 = await bcrypt.compare('supersales123', hashMain);
  console.log({ matchB1, matchB2, matchM1 });
})();
