import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Post from './Post';

const mockPost = {
    userImage: 'user-image-url',
    userName: 'John Doe',
    date: '2023-10-01',
    title: 'Post Title',
    body: 'Post body content',
    postImages: ['image1-url', 'image2-url'],
};

describe('Post Component', () => {
    test('renders post user image', () => {
        render(<Post post={mockPost} />);
        const userImage = screen.getByAltText(mockPost.userName);
        expect(userImage).toBeInTheDocument();
        expect(userImage).toHaveAttribute('src', mockPost.userImage);
    });

    test('renders post title and body', () => {
        render(<Post post={mockPost} />);
        expect(screen.getByText(mockPost.title)).toBeInTheDocument();
        expect(screen.getByText(mockPost.body)).toBeInTheDocument();
    });

    test('renders post date', () => {
        render(<Post post={mockPost} />);
        expect(screen.getByText(mockPost.date)).toBeInTheDocument();
    });

    test('renders post images and navigates between them', () => {
        render(<Post post={mockPost} />);
        const postImage = screen.getByAltText('Post');
        expect(postImage).toBeInTheDocument();
        expect(postImage).toHaveAttribute('src', mockPost.postImages[0]);

        const nextButton = screen.getByText('❯');
        fireEvent.click(nextButton);
        expect(postImage).toHaveAttribute('src', mockPost.postImages[1]);

        const prevButton = screen.getByText('❮');
        fireEvent.click(prevButton);
        expect(postImage).toHaveAttribute('src', mockPost.postImages[0]);
    });

    test('Post Component renders post action buttons', () => {
        render(<Post post={mockPost} />);
        expect(screen.getByText('like')).toBeInTheDocument();
        expect(screen.getByText('show comments')).toBeInTheDocument();
        expect(screen.getByText('share')).toBeInTheDocument();
        expect(screen.getByText('edit')).toBeInTheDocument();
    });
});