import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// POST /api/contact
export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate fields
    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Full name is required' });
      return;
    }
    if (!email || !email.trim()) {
      res.status(400).json({ message: 'Email address is required' });
      return;
    }
    if (!subject || !subject.trim()) {
      res.status(400).json({ message: 'Subject is required' });
      return;
    }
    if (!message || !message.trim()) {
      res.status(400).json({ message: 'Message content is required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ message: 'Please enter a valid email address' });
      return;
    }

    // Create the message in DB
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'NEW',
        source: 'Website Contact Form',
      },
    });

    res.status(201).json({
      message: "Thank you for contacting AVORO. We'll get back to you soon.",
      contactMessage,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'An error occurred while submitting your message.' });
  }
};
