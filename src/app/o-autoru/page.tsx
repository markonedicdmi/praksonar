import { redirect } from 'next/navigation';

// Consolidated: /o-autoru redirects to /o-meni which is the canonical about page
export default function OAutoruRedirect() {
    redirect('/o-meni');
}
