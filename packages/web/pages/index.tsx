import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Props
{

}

const Home = ({ }: Props) =>
{
    const router = useRouter();

    useEffect(() =>
    {
        router.push(`/p/${uuidv4()}`)
    }, [])

    return (
        <h1>Redirecting...</h1>
    );
}

export default Home;