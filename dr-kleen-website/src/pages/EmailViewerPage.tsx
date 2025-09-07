import React from 'react';
import EmailViewer from '../components/admin/EmailViewer';
import { useSearchParams } from 'react-router-dom';

export default function EmailViewerPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  return <EmailViewer userEmail={email || undefined} />;
}