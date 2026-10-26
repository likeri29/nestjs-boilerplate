import { Button, Heading, Section, Text } from '@react-email/components';
import type { CSSProperties, ReactElement } from 'react';

import { EmailLayout } from 'modules/mail/templates/components/email-layout.component';

type NotificationTemplateProps = {
  heading: string;
  paragraphs: string[];
  previewText?: string;
  action?: { label: string; url: string };
  footerText?: string;
};

const headingStyle: CSSProperties = {
  color: '#18181b',
  fontSize: '22px',
  fontWeight: 600,
  margin: '0 0 16px',
};

const paragraphStyle: CSSProperties = {
  color: '#3f3f46',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px',
};

const buttonStyle: CSSProperties = {
  backgroundColor: '#18181b',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 500,
  padding: '12px 20px',
  textDecoration: 'none',
};

export function NotificationTemplate({
  heading,
  paragraphs,
  previewText = heading,
  action,
  footerText,
}: NotificationTemplateProps): ReactElement {
  return (
    <EmailLayout previewText={previewText} footerText={footerText}>
      <Heading as="h1" style={headingStyle}>
        {heading}
      </Heading>
      {paragraphs.map((paragraph) => (
        <Text key={paragraph} style={paragraphStyle}>
          {paragraph}
        </Text>
      ))}
      {action && (
        <Section style={{ marginTop: '24px' }}>
          <Button href={action.url} style={buttonStyle}>
            {action.label}
          </Button>
        </Section>
      )}
    </EmailLayout>
  );
}
