import { EntitySeeder } from 'src/interface/seeder';
import { EntityManager } from 'typeorm';
import { User } from 'src/typeorm/entities/User.entity';
import * as bcrypt from 'bcryptjs';

export class AdminUserSeeder implements EntitySeeder {
  async run(db: EntityManager): Promise<void> {
    const adminData = {
      email: process.env.ADMIN_MAIL,
      password: process.env.ADMIN_PASS,
      role: 'admin',
      fullName: 'Admin User',
      status: 'active',
    };
    const existingAdmin = await db.findOne(User, {
      where: { role: 'admin' },
    });

    if (existingAdmin !== null) {
      existingAdmin.email = adminData.email;
      existingAdmin.fullName = adminData.fullName;
      existingAdmin.status = adminData.status;

      await db.save(existingAdmin);
      console.log('Admin user updated.');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const newAdmin = db.create(User, {
      ...adminData,
      password: hashedPassword,
    });

    await db.save(newAdmin);
    console.log('Admin user created successfully.');
  }
}
