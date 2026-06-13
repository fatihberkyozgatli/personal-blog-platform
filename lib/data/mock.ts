import type { Category, Comment, PostFull, Tag } from "./types";

export const mockTags: Tag[] = [
  { id: "t1", name: "Patience", slug: "patience" },
  { id: "t2", name: "Memory", slug: "memory" },
  { id: "t3", name: "Stillness", slug: "stillness" },
  { id: "t4", name: "Empire", slug: "empire" },
  { id: "t5", name: "Gratitude", slug: "gratitude" },
];

export const mockCategories: Category[] = [
  { id: "c1", name: "Reflections", slug: "reflections", description: "Quiet thoughts on living well." },
  { id: "c2", name: "Faith", slug: "faith", description: "On belief, doubt, and devotion." },
  { id: "c3", name: "History", slug: "history", description: "Lessons from empires and eras past." },
  { id: "c4", name: "Literature", slug: "literature", description: "Words that have shaped us." },
  { id: "c5", name: "Society", slug: "society", description: "How we live together." },
  { id: "c6", name: "Personal Growth", slug: "personal-growth", description: "Becoming, slowly." },
];

const author = { id: "a1", displayName: "The Author", avatarUrl: null };

function doc(paragraphs: string[]) {
  return {
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "A Beginning" }] },
      ...paragraphs.map((text) => ({
        type: "paragraph",
        content: [{ type: "text", text }],
      })),
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Patience is not the ability to wait, but the grace with which we wait.",
              },
            ],
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "And so the page turns, as it always has, toward the next quiet morning." },
        ],
      },
    ],
  };
}

const longBody = [
  "There is a particular stillness to the early hours, before the world remembers itself. In that stillness, the small things speak loudest: the cooling of tea, the slant of light against an old wall, the patience of those who came before us.",
  "We inherit more than we know. The histories we read are not distant; they are the grammar of how we live now. To read them slowly is to learn a kind of humility.",
  "What follows is an attempt to pay attention. Nothing more, nothing less.",
];

function makePost(
  i: number,
  title: string,
  slug: string,
  categorySlug: string,
  readingTime: number,
  views: number,
  likes: number,
  daysAgo: number,
  excerpt: string,
): PostFull {
  const category = mockCategories.find((c) => c.slug === categorySlug) ?? null;
  const publishedAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
  return {
    id: `p${i}`,
    title,
    slug,
    coverImage: null,
    excerpt,
    category,
    author,
    publishedAt,
    readingTime,
    viewCount: views,
    likeCount: likes,
    status: "published",
    tags: [],
    content: doc(longBody),
  };
}

export const mockPosts: PostFull[] = [
  makePost(1, "Finding Meaning in the Everyday", "finding-meaning-in-the-everyday", "reflections", 5, 1280, 86, 1,
    "Thoughts on how small moments hold great significance, if only we pause to see."),
  makePost(2, "The Beauty of Patience in a Restless World", "the-beauty-of-patience", "reflections", 6, 940, 64, 3,
    "In a world that prizes speed, patience becomes a quiet act of resistance."),
  makePost(3, "In the Footsteps of Forgotten Empires", "in-the-footsteps-of-forgotten-empires", "history", 8, 1530, 102, 7,
    "Walking the ruins of what once was, and what their silence still teaches us."),
  makePost(4, "A Letter to My Younger Self", "a-letter-to-my-younger-self", "personal-growth", 4, 2100, 188, 10,
    "If I could send a single page back through the years, this is what it would say."),
  makePost(5, "On Gratitude and Contentment", "on-gratitude-and-contentment", "faith", 5, 760, 55, 14,
    "Gratitude changes the way we see the world, and ourselves within it."),
  makePost(6, "The Art of Slowing Down", "the-art-of-slowing-down", "personal-growth", 5, 880, 73, 18,
    "In a world that never stops, choosing stillness is an act of wisdom."),
  makePost(7, "Lessons from the Old Masters", "lessons-from-the-old-masters", "literature", 7, 690, 41, 22,
    "Timeless wisdom from those who wrote before our time."),
  makePost(8, "Between Dreams and Reality", "between-dreams-and-reality", "reflections", 6, 1020, 90, 26,
    "Exploring the delicate balance between what we dream and what we live."),
];

mockPosts.forEach((p, i) => {
  p.tags = [mockTags[i % mockTags.length], mockTags[(i + 2) % mockTags.length]];
});

export const mockComments: Comment[] = [
  {
    id: "cm1",
    postId: "p1",
    author: { id: "r1", displayName: "Amina", avatarUrl: null },
    parentId: null,
    body: "This put words to something I have felt for a long time. Thank you.",
    approved: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    replies: [
      {
        id: "cm2",
        postId: "p1",
        author,
        parentId: "cm1",
        body: "That means a great deal. Grateful you read it.",
        approved: true,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
  },
];
