import { NextResponse } from 'next/server';

export interface InstagramPost {
  id: string;
  type: 'IMAGE' | 'REEL';
  mediaUrl: string;
  permalink: string;
  caption: string;
  likesCount?: number;
  commentsCount?: number;
}

const FALLBACK_POSTS: InstagramPost[] = [
  {
    id: 'post-1',
    type: 'REEL',
    mediaUrl: '/images/bottles/velvet-oud.jpg',
    permalink: 'https://www.instagram.com/avoro.official/',
    caption: 'Golden hour moments captured with Velvet Oud. Sillage that lasts from day into night. ✨ #AVORO #VelvetOud #LuxuryFragrance',
    likesCount: 1420,
    commentsCount: 84,
  },
  {
    id: 'post-2',
    type: 'IMAGE',
    mediaUrl: '/images/hero-perfume.png',
    permalink: 'https://www.instagram.com/avoro.official/',
    caption: 'Crafted with passion, bottled with perfection. The signature glass silhouette of AVORO. 🌿 #ArtisanalPerfume #AVORO',
    likesCount: 980,
    commentsCount: 42,
  },
  {
    id: 'post-3',
    type: 'REEL',
    mediaUrl: '/images/bottles/vanilla-ember.jpg',
    permalink: 'https://www.instagram.com/avoro.official/',
    caption: 'Unboxing timeless elegance. Experience Vanilla Ember in every spritz. 🔥 #ScentOfTheDay #AVOROFamily',
    likesCount: 2150,
    commentsCount: 112,
  },
  {
    id: 'post-4',
    type: 'IMAGE',
    mediaUrl: '/images/bottles/blue-amber.jpg',
    permalink: 'https://www.instagram.com/avoro.official/',
    caption: 'Minimalist aesthetic for maximum impact. How do you style your AVORO bottle? 💎 #FragranceLover #AVORO',
    likesCount: 1640,
    commentsCount: 56,
  },
  {
    id: 'post-5',
    type: 'IMAGE',
    mediaUrl: '/images/bottles/crimson-bloom.jpg',
    permalink: 'https://www.instagram.com/avoro.official/',
    caption: 'Fresh notes of bergamot and rare sandalwood. Made for those who appreciate true craftsmanship. 🌊 #BlueAmber #AVORO',
    likesCount: 1890,
    commentsCount: 93,
  },
  {
    id: 'post-6',
    type: 'REEL',
    mediaUrl: '/images/bottle-sukoon.png',
    permalink: 'https://www.instagram.com/avoro.official/',
    caption: 'Pure tranquility captured in scent. Behind the scenes of Sukoon creation. 🍃 #PerfumeArt #AVORO',
    likesCount: 1310,
    commentsCount: 67,
  },
  {
    id: 'post-7',
    type: 'IMAGE',
    mediaUrl: '/images/bottle-ete.png',
    permalink: 'https://www.instagram.com/avoro.official/',
    caption: 'Luxury in every detail. Tag @avoro.official in your posts to be featured on our community reel! ✨',
    likesCount: 1750,
    commentsCount: 78,
  },
  {
    id: 'post-8',
    type: 'IMAGE',
    mediaUrl: '/images/bottle-noir.png',
    permalink: 'https://www.instagram.com/avoro.official/',
    caption: 'Dark, alluring, unforgettable. Discover Noir by AVORO. 🌙 #NicheFragrance #AVORO',
    likesCount: 2410,
    commentsCount: 145,
  },
];

const DEFAULT_TOKEN = 'EAANwRxwViqkBSXqZCcb5OQSaD7CxOzDIHgcyUi00zrtOu4VDxGEkctoD8t1ZCQQbKiRFikz0uoXGNnyZBhAbrLPCactW0ZAAsNB0zhZCQz6ZA7QtgkiRjOg42jIs2rzsZBvlVld1gmjPJCZCqS5MarQHriEVmdMWBAosDr6iBF3VfLer4c8afrnC44MImC2K';
const DEFAULT_BUSINESS_ID = '17841427307422411';

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || DEFAULT_TOKEN;
  const businessId = process.env.INSTAGRAM_BUSINESS_ID || DEFAULT_BUSINESS_ID;

  if (accessToken) {
    try {
      let apiUrl = '';
      if (businessId) {
        // Facebook Graph API for Business Account
        apiUrl = `https://graph.facebook.com/v20.0/${businessId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,like_count,comments_count,timestamp&limit=12&access_token=${accessToken}`;
      } else {
        // Instagram Basic Display API
        apiUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,like_count,comments_count&limit=12&access_token=${accessToken}`;
      }

      const res = await fetch(apiUrl, { cache: 'no-store' });
      const data = await res.json();

      if (res.ok && data.data && Array.isArray(data.data) && data.data.length > 0) {
        const posts: InstagramPost[] = data.data.map((item: any) => ({
          id: item.id,
          type: item.media_type === 'VIDEO' ? 'REEL' : 'IMAGE',
          mediaUrl: item.thumbnail_url || item.media_url,
          permalink: item.permalink || 'https://www.instagram.com/avoro.official/',
          caption: item.caption || 'AVORO Artisanal Fragrance',
          likesCount: item.like_count,
          commentsCount: item.comments_count,
        }));
        return NextResponse.json({ posts, source: businessId ? 'graph_api' : 'basic_display' });
      } else {
        console.warn('Instagram API Response not OK or empty:', data);
      }
    } catch (error) {
      console.error('Error fetching live Instagram posts:', error);
    }
  }

  return NextResponse.json({ posts: FALLBACK_POSTS, source: 'fallback' });
}
