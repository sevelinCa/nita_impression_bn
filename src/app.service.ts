import { Injectable, Inject } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from './mail/mail.service';
import { User } from './typeorm/entities/User.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { ReportsService } from './reports/reports.service';
import { Event } from './typeorm/entities/Event.entity';
import { AdminUserSeeder } from './seeders/AdminSeeder';
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject() private readonly mailService: MailService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @Inject() private readonly reportService: ReportsService,
    protected readonly adminUserSeeder: AdminUserSeeder,
    @InjectEntityManager()
    protected readonly db: EntityManager,
  ) {}

  getHello(): string {
    this.logger.log('getHello method called.');
    return 'Hello World!';
  }

  async onApplicationBootstrap() {
    await this.adminUserSeeder.run(this.db);
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async sendDailyEmails(): Promise<void> {
    try {
      this.logger.log('sendDailyEmails Cron Job started.');

      const user = await this.userRepository.findOne({
        where: { role: 'admin' },
      });

      if (!user) {
        this.logger.error('Admin user not found. Aborting email job.');
        return;
      }

      const report = await this.reportService.monthlyReport();

      if (!report) {
        this.logger.error('Report data is missing. Cannot send emails.');
        return;
      }

      await this.mailService.sendReportEmail(
        user.email,
        user.fullName,
        report.totalIncome,
        report.totalExpense,
        report.totalEvents,
        report.events,
      );

      this.logger.log('sendDailyEmails Cron Job completed successfully.');
    } catch (error) {
      this.logger.error(
        `Error occurred during sendDailyEmails Cron Job: ${error.message}`,
        error.stack,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendEmailWeekBeforeEventDate(): Promise<void> {
    this.logger.log('sendEmailWeekBeforeEventDate Cron Job started.');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);

    const events = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.date = :date', {
        date: oneWeekLater.toISOString().split('T')[0],
      })
      .getMany();

    const adminUser = await this.userRepository.findOne({
      where: { role: 'admin' },
    });

    if (adminUser == null) {
      this.logger.error('No admin user found. Cannot send reminder emails.');
      return;
    }

    for (const event of events) {
      await this.mailService.sendEventReminderEmail(
        adminUser.email,
        adminUser.fullName,
        event.name,
        event.date,
        'week',
      );
      this.logger.log(
        `Notification sent to admin (${adminUser.email}) for event "${event.name}"`,
      );
    }

    this.logger.log('sendEmailWeekBeforeEventDate Cron Job completed.');
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendBirthdayNotifications(): Promise<void> {
    this.logger.log('sendBirthdayNotifications Cron Job started.');

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const adminUser = await this.userRepository.findOne({
      where: { role: 'admin' },
    });

    if (adminUser == null) {
      this.logger.error(
        'No admin user found. Cannot send birthday notifications.',
      );
      return;
    }

    const employeesWithBirthday = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'worker' })
      .andWhere('EXTRACT(MONTH FROM user.age) = :month', {
        month: currentMonth,
      })
      .andWhere('EXTRACT(DAY FROM user.age) = :day', {
        day: currentDay,
      })
      .getMany();

    if (employeesWithBirthday.length > 0) {
      const birthdayNames = employeesWithBirthday
        .map((emp) => emp.fullName)
        .join(', ');

      await this.mailService.sendBirthdayNotificationEmail(
        adminUser.email,
        adminUser.fullName,
        birthdayNames,
      );

      this.logger.log(
        `Birthday notification sent to admin for employees: ${birthdayNames}`,
      );
    } else {
      this.logger.log('No employee birthdays today.');
    }

    this.logger.log('sendBirthdayNotifications Cron Job completed.');
  }
}
