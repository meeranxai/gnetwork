import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../api/config';

const CreatePost = () => {
    const { currentUser } = useAuth();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePost = async () => {
        if (!text.trim() || !currentUser) return;
        setLoading(true);

        try {
            const token = await currentUser.getIdToken();

            // Backend uses Multer (Upload), so we must use FormData
            const formData = new FormData();
            formData.append('description', text);
            formData.append('authorId', currentUser.uid);
            formData.append('author', currentUser.displayName || 'User');
            formData.append('authorAvatar', currentUser.photoURL || '');
            // formData.append('image', file); // Future media support

            const response = await fetch(`${API_BASE_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'multipart/form-data', // Skip content-type for FormData (let browser set boundary)
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                setText('');
                // Ideally refresh feed here (Needs context or reload)
                window.location.reload();
            } else {
                console.error('Post failed');
                alert('Failed to create post');
            }
        } catch (error) {
            console.error('Error posting:', error);
            alert('Error creating post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="create-composer glass-blur" id="inline-composer">
            <div className="composer-top">
                <img
                    src={currentUser?.photoURL || '/images/default-avatar.png'}
                    alt="User"
                    className="user-avatar-sm"
                    id="composer-avatar"
                />
                <div className="input-wrapper">
                    <textarea
                        id="composer-text"
                        placeholder="What's happening in tech?"
                        rows="1"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={loading}
                    ></textarea>
                </div>
            </div>

            <div className="composer-actions" id="composer-actions">
                <div className="media-trigger">
                    <button className="action-btn-text icon-photo">
                        <i className="fas fa-image"></i> <span>Photo</span>
                    </button>
                    <button className="action-btn-text icon-video">
                        <i className="fas fa-video"></i> <span>Video</span>
                    </button>
                </div>
                <button
                    className="btn-post-minimal"
                    id="inline-post-btn"
                    style={{ display: text ? 'block' : 'none' }}
                    onClick={handlePost}
                    disabled={loading}
                >
                    {loading ? 'Posting...' : 'Post'}
                </button>
            </div>
            <input type="file" id="inline-file-input" hidden accept="image/*" />
        </section>
    );
};

export default CreatePost;
