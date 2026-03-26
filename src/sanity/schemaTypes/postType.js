import { defineArrayMember, defineField, defineType } from 'sanity';

export const postType = defineType({
  name: 'post',
  title: 'Posts',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(8),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(220),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      initialValue: 'TASI Team',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Announcement', value: 'ANNOUNCEMENT' },
          { title: 'Registration', value: 'REGISTRATION' },
          { title: 'Community', value: 'COMMUNITY' },
          { title: 'Commentary', value: 'COMMENTARY' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sourceUrl',
      title: 'External source URL',
      type: 'url',
      description:
        'Optional. Use this when the article lives on another website.',
    }),
    defineField({
      name: 'image',
      title: 'Cover image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'image',
    },
  },
});
