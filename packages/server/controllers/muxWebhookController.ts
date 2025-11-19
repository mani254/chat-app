import { Request, Response } from 'express';
import Mux from '@mux/mux-node';
import { Video } from '@workspace/database';

const muxClient = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export const handleMuxWebhook = async (req: Request, res: Response) => {
  try {
    const body = await getRawBody(req);
    const event = muxClient.webhooks.unwrap(
      body,
      req.headers as any,
      process.env.MUX_WEBHOOK_SIGNING_SECRET as string,
    );

    switch (event.type) {
      case 'video.upload.asset_created': {
        const assetId = (event.data as any)?.id || (event.data as any)?.asset_id;
        if (assetId) {
          await Video.updateOne({ assetId }, { $setOnInsert: { status: 'processing' } }, { upsert: true });
        }
        break;
      }
      case 'video.asset.ready': {
        const assetId = (event.data as any)?.id;
        const playbackId = (event.data as any)?.playback_ids?.[0]?.id;
        if (assetId && playbackId) {
          await Video.updateOne(
            { assetId },
            { $set: { playbackId, status: 'ready' } },
            { upsert: true },
          );
        }
        break;
      }
      case 'video.asset.errored': {
        const assetId = (event.data as any)?.id;
        if (assetId) {
          await Video.updateOne({ assetId }, { $set: { status: 'failed' } });
        }
        break;
      }
      default:
        break;
    }

    res.json({ message: 'ok' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid webhook' });
  }
};

function getRawBody(req: Request): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', (e) => reject(e));
  });
}