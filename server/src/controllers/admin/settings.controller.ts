import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.storeSetting.findMany();
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json(map);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const entries: { key: string; value: string }[] = req.body.settings;

    await Promise.all(
      entries.map(({ key, value }) =>
        prisma.storeSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );

    res.json({ message: 'Settings updated' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
