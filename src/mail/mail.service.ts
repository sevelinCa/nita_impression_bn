import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

interface EventReportEmailData {
  username: string;
  name: string;
  customers: number;
  customerEmail: string;
  eventId: string;
  eventDate: Date;
  totalIncome: number;
  itemizedExpenses: Array<{
    name: string;
    quantity: number;
    cost: number;
  }>;
  employeeFee?: number;
  totalExpense?: number;
}
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string, username: string) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Password Reset Request',
      html: `<html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #dddddd;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333333;
          }
          .content {
            padding: 20px;
            color: #333333;
          }
          .content p {
            line-height: 1.6;
          }
          .code {
            display: block;
            width: fit-content;
            margin: 20px auto;
            padding: 10px 20px;
            font-size: 24px;
            background-color: #f0f0f0;
            border: 1px solid #cccccc;
            border-radius: 4px;
            text-align: center;
            letter-spacing: 2px;
          }
          .footer {
            padding-top: 20px;
            border-top: 1px solid #dddddd;
            text-align: center;
            font-size: 12px;
            color: #999999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hey ${username}, You are receiving this because you have requested the reset of the password for your account.</p>
            <p>Your password reset code is:</p>
            <div class="code">${token}</div>
            <p>Please enter this 5-digit code in the provided field to complete the process. This code will expire in 5 minutes.</p>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>Thank you,</p>
            <p>Nita-impressions</p>
          </div>
        </div>
      </body>
    </html>
    `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendNewProduct(
    to: string,
    name: string,
    description: string,
    imagePath: string,
    price: number,
    category: string,
    quantity: number,
    discount: number,
    size: string[],
    season: string,
  ) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'New Product Alert!',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 2px; overflow: hidden;">
      <div style="background-color: #007bff; color: white; padding: 10px 20px;">
        <h1 style="margin: 0;">New Product: ${name}</h1>
      </div>
      <div style="padding: 20px;">
        <p style="font-size: 16px; line-height: 1.6;">${description}</p>
        <img src="${imagePath}" alt="${name}" style="width: 100%; max-width: 600px;;">
        <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">Price: ${price} RWF</p>
        <p style="margin: 5px 0;"><strong>Category:</strong> ${category}</p>
        <p style="margin: 5px 0;"><strong>Quantity:</strong> ${quantity}</p>
        <p style="margin: 5px 0;"><strong>Season:</strong> ${season}</p>
        <p style="margin: 5px 0;"><strong>Discount:</strong> ${discount ? discount + '%' : 'No discount available'}</p>
        ${size ? `<p style="margin: 5px 0;"><strong>Size:</strong> ${size}</p>` : ''}
        <a href="https://main--mugaboshafi-danny-portfolio.netlify.app" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Product</a>
        <p style="margin-top: 20px;">Don't miss out on our latest product!</p>
      </div>
      <div style="background-color: #f4f4f4; padding: 10px 20px; text-align: center; border-top: 1px solid #ddd;">
        <p style="margin: 0; font-size: 12px; color: #888;">You are receiving this email because you subscribed to our newsletter.</p>
        <p style="margin: 0; font-size: 12px; color: #888;">If you no longer wish to receive these emails, please <a href="unsubscribe-link" style="color: #007bff; text-decoration: none;">unsubscribe</a>.</p>
        <p style="margin: 0; font-size: 12px; color: #888;">&copy; 2024 roumeza. All rights reserved.</p>
      </div>
    </div>`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendMessageEmail(
    to: string,
    name: string,
    contact: string,
    email: string,
    message: string,
  ) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'New Message Received',
      html: `<html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #dddddd;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333333;
          }
          .content {
            padding: 20px;
            color: #333333;
          }
          .content p {
            line-height: 1.6;
          }
          .contact-info {
            background-color: #f0f0f0;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
          }
          .contact-info p {
            margin: 0;
          }
          .footer {
            padding-top: 20px;
            border-top: 1px solid #dddddd;
            text-align: center;
            font-size: 12px;
            color: #999999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Message from ${name}</h1>
          </div>
          <div class="content">
            <p>You have received a new message through the contact form:</p>
            <div class="contact-info">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Contact:</strong> ${contact ? contact : 'N/A'}</p>
              <p><strong>Email:</strong> ${email}</p>
            </div>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
          <div class="footer">
            <p>Thank you,</p>
            <p>Your Website Team</p>
          </div>
        </div>
      </body>
    </html>
    `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendReportEmail(
    to: string,
    name: string,
    totalIncome: number,
    totalExpense: number,
    eventsTotal: number,
  ): Promise<void> {
    try {
      const formatPrice = (price: number) => {
        return new Intl.NumberFormat().format(price);
      };
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Monthly Report: Performance Overview',
        html: `<html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 1px solid #dddddd;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #333333;
            }
            .content {
              padding: 20px;
              color: #333333;
            }
            .content p {
              line-height: 1.6;
            }
            .footer {
              padding-top: 20px;
              border-top: 1px solid #dddddd;
              text-align: center;
              font-size: 12px;
              color: #999999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Monthly Performance Report</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>I hope this message finds you well. As part of our ongoing effort to keep you informed, we are sharing the monthly report summarizing key metrics for the past month. Please find the details below:</p>
              <ul>
                <li><strong>Total Number of Events:</strong> ${eventsTotal}</li>
                <li><strong>Total Income Generated:</strong> ${formatPrice(totalIncome)} RWF</li>
                <li><strong>Total Expenses Incurred:</strong> ${formatPrice(totalExpense)} RWF</li>
              </ul>
              <p>This report provides an overview of the performance for the month, detailing our financial income, expenses, and the number of events conducted. We are committed to ensuring efficient operations and fiscal responsibility, while also increasing our engagement through events.</p>
              <p>We remain focused on improving these key areas and look forward to reviewing the progress in the upcoming month.</p>
            </div>
            <div class="footer">
              <p>Thank you for your continued leadership and support.</p>
              <p>Best regards,</p>
              <p>The Nita-Impressions</p>
              <p>&copy; ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
      </html>`,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending report email:', error.message);
    }
  }

  async sendEventReport(data: EventReportEmailData): Promise<void> {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat().format(price);
    };

    const calculateTotal = (expenses: Array<{ cost: number }>) => {
      return expenses.reduce((sum, item) => sum + item.cost, 0);
    };

    const totalExpenses =
      calculateTotal(data.itemizedExpenses) + (data.employeeFee || 0);
    const profitMargin = (
      ((data.totalIncome - totalExpenses) / data.totalIncome) *
      100
    ).toFixed(1);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: data.customerEmail,
      subject: `Event Financial Report: ${data.eventId}`,
      html: `<html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 1px solid #dddddd;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #333333;
            }
            .content {
              padding: 20px;
              color: #333333;
            }
            .content p {
              line-height: 1.6;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .details-table th, .details-table td {
              padding: 10px;
              border: 1px solid #dddddd;
              text-align: left;
            }
            .details-table th {
              background-color: #f8f8f8;
            }
            .summary-row {
              background-color: #f8f8f8;
              font-weight: bold;
            }
            .profit-positive {
              color: #28a745;
            }
            .profit-negative {
              color: #dc3545;
            }
            .footer {
              padding-top: 20px;
              border-top: 1px solid #dddddd;
              text-align: center;
              font-size: 12px;
              color: #999999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Event Financial Report</h1>
            </div>
            <div class="content">
              <p>Dear ${data.username},</p>
              <p>Please find below the detailed financial analysis for Event ID: ${data.eventId}</p>
              
              <h3>Event Overview</h3>
              <table class="details-table">
                <tr>
                  <th>Event ID</th>
                  <td>${data.eventId}</td>
                </tr>
                <tr>
                  <th>Event Name</th>
                  <td>${data.name}</td>
                </tr>
                <tr>
                  <th>Event Date</th>
                  <td>${new Date(data.eventDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <th>Employees</th>
                  <td>${data.customers}</td>
                </tr>
                <tr>
                  <th>Revenue Generated</th>
                  <td>${formatPrice(data.totalIncome)} RWF</td>
                </tr>
              </table>

              <h3>Financial Breakdown</h3>
              <table class="details-table">
                <thead>
                  <tr>
                    <th>Expense Item</th>
                    <th>Quantity</th>
                    <th>Cost (RWF)</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.itemizedExpenses
                    .map(
                      (item) => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                      <td>${formatPrice(item.cost)}</td>
                    </tr>
                  `,
                    )
                    .join('')}
                  ${
                    data.employeeFee
                      ? `<tr>
                          <td>Employee Fee</td>
                          <td>1</td>
                          <td>${formatPrice(data.employeeFee)}</td>
                        </tr>`
                      : ''
                  }
                  <tr class="summary-row">
                    <td colspan="2">Total Expenses</td>
                    <td>${formatPrice(data.totalExpense)}</td>
                  </tr>
                </tbody>
              </table>

              <h3>Profit Analysis</h3>
              <table class="details-table">
                <tr>
                  <th>Total Revenue</th>
                  <td>${formatPrice(data.totalIncome)} RWF</td>
                </tr>
                <tr>
                  <th>Total Expenses</th>
                  <td>${formatPrice(totalExpenses)} RWF</td>
                </tr>
                <tr>
                  <th>Net Profit</th>
                  <td class="${data.totalIncome - totalExpenses >= 0 ? 'profit-positive' : 'profit-negative'}">
                    ${formatPrice(data.totalIncome - totalExpenses)} RWF
                  </td>
                </tr>
                <tr>
                  <th>Profit Margin</th>
                  <td class="${Number(profitMargin) >= 0 ? 'profit-positive' : 'profit-negative'}">
                    ${profitMargin}%
                  </td>
                </tr>
              </table>

              <p style="margin-top: 20px;">
                This financial report has been automatically generated upon event closure. 
                Please review the figures and maintain this record for our financial documentation.
              </p>
            </div>
            <div class="footer">
              <p>Generated by Nita-Impressions Management System</p>
              <p>${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}</p>
              <p>&copy; ${new Date().getFullYear()} Nita-Impressions</p>
            </div>
          </div>
        </body>
      </html>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
