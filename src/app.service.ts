import { Injectable, Inject } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from './mail/mail.service';
import { User } from './typeorm/entities/User.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportsService } from './reports/reports.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject() private readonly mailService: MailService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject() private readonly reportService: ReportsService,
  ) {}

  getHello(): string {
    this.logger.log('getHello method called.');
    return 'Hello World!';
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  async sendDailyEmails(): Promise<void> {
    this.logger.log('sendDailyEmails Cron Job started.');
    const user = await this.userRepository.findOne({
      where: { role: 'admin' },
    });
    const events = await this.reportService.monthlyReport();
    await this.mailService.sendReportEmail(
      user.email,
      user.fullName,
      events.totalIncome,
      events.totalExpense,
      events.totalEvents,
    );
    this.logger.log(`Email sent to ${user.email}`);
    this.logger.log('sendDailyEmails Cron Job completed.');
  }
}
