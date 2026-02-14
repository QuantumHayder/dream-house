import * as bcrypt from 'bcrypt';

async function hashPassword() {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('Admin123!', salt);
  console.log(hashedPassword);
}

hashPassword();
