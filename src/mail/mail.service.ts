import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

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
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
}
