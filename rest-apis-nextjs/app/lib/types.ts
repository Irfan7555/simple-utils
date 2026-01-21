export interface Blog {
    id: number;
    title: string;
    content: string;
    slug: string;
    published: boolean;
    created_at: string;
    owner_id: number;
}

export interface CreateBlogRequest {
    title: string;
    content: string;
    published?: boolean;
}

export interface Token {
    access_token: string;
    token_type: string;
}

export interface CreateUserRequest {
    username: string;
    password: string;
}
