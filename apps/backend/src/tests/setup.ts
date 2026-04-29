process.env.NODE_ENV = "test";
process.env.PORT = "4000";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/lab_report_blockchain_test?schema=public";
process.env.JWT_SECRET = "super_secret_testing_key_123";
process.env.JWT_EXPIRES_IN = "1d";
process.env.BCRYPT_SALT_ROUNDS = "10";
process.env.UPLOAD_DIR = "uploads-test";
process.env.MAX_FILE_SIZE_MB = "10";
process.env.BLOCKCHAIN_RPC_URL = "http://127.0.0.1:8545";
process.env.BLOCKCHAIN_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000001";
process.env.BLOCKCHAIN_PRIVATE_KEY =
  "0x1000000000000000000000000000000000000000000000000000000000000001";
