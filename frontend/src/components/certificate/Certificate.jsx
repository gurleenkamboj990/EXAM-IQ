import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Certificate – a print-ready component.
 * Pass `ref` for html2canvas capture; `forPrint` removes shadows.
 *
 * Props:
 *  certificate: { id, studentName, examTitle, subject, score, totalMarks,
 *                 percentage, grade, issuedAt }
 */
const Certificate = forwardRef(function Certificate({ certificate, forPrint = false }, ref) {
  if (!certificate) return null;

  const {
    id,
    studentName,
    examTitle,
    subject,
    score,
    totalMarks,
    percentage,
    grade,
    issuedAt,
  } = certificate;

  const verifyUrl = `${window.location.origin}/verify/${id}`;
  const issuedDate = issuedAt
    ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(issuedAt)
      )
    : '';

  const shadow = forPrint ? 'none' : '0 20px 60px rgba(0,0,0,0.12)';

  return (
    <div
      ref={ref}
      style={{
        width: 1056,
        height: 748,
        background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
        position: 'relative',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        boxShadow: shadow,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Outer decorative border */}
      <div
        style={{
          position: 'absolute',
          inset: 16,
          border: '3px solid #4f46e5',
          borderRadius: 20,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 22,
          border: '1px solid #c7d2fe',
          borderRadius: 16,
          pointerEvents: 'none',
        }}
      />

      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-30deg)',
          fontSize: 120,
          fontWeight: 900,
          color: 'rgba(79,70,229,0.04)',
          letterSpacing: -4,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        EXAMIQ
      </div>

      {/* Top accent strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #2563eb)',
          borderRadius: '20px 20px 0 0',
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 80px',
          gap: 0,
        }}
      >
        {/* Logo + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: -1,
            }}
          >
            IQ
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#1e1b4b', letterSpacing: -0.5 }}>
              ExamIQ
            </div>
            <div style={{ fontSize: 10, color: '#6366f1', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
              Intelligent Examination Platform
            </div>
          </div>
        </div>

        {/* Certificate of Achievement heading */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>
            Certificate of Achievement
          </div>
          <div style={{ width: 60, height: 2, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            This is to certify that
          </div>
        </div>

        {/* Student Name */}
        <div
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: '#1e1b4b',
            letterSpacing: -1,
            marginBottom: 8,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          {studentName}
        </div>

        {/* Body text */}
        <div style={{ fontSize: 14, color: '#475569', textAlign: 'center', marginBottom: 6, maxWidth: 620 }}>
          has successfully completed the examination
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#3730a3',
            textAlign: 'center',
            marginBottom: 4,
            maxWidth: 680,
            lineHeight: 1.3,
          }}
        >
          {examTitle}
        </div>
        {subject && (
          <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600, marginBottom: 20, letterSpacing: 1 }}>
            {subject}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
          {[
            { label: 'Score', value: `${score}/${totalMarks}` },
            { label: 'Percentage', value: `${percentage}%` },
            { label: 'Grade', value: grade || 'A' },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: 'white',
                borderRadius: 14,
                padding: '10px 24px',
                textAlign: 'center',
                border: '1.5px solid #e0e7ff',
                minWidth: 100,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: '#4f46e5' }}>{value}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Footer row: date + cert ID + signatures + QR */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '1px solid #e0e7ff',
            paddingTop: 16,
            gap: 16,
          }}
        >
          {/* Left: date + cert ID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
              Date Issued
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{issuedDate}</div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                Certificate ID
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#4f46e5',
                  fontFamily: 'monospace',
                  letterSpacing: 1,
                  background: '#eef2ff',
                  padding: '3px 10px',
                  borderRadius: 6,
                  display: 'inline-block',
                  marginTop: 2,
                }}
              >
                {id}
              </div>
            </div>
          </div>

          {/* Centre: Signatures */}
          <div style={{ display: 'flex', gap: 48, flex: 1, justifyContent: 'center' }}>
            {[
              { title: 'Director', name: 'ExamIQ Board' },
              { title: 'Examinations Office', name: 'Academic Council' },
            ].map(({ title, name }) => (
              <div key={title} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 120,
                    borderBottom: '1.5px solid #94a3b8',
                    marginBottom: 4,
                    height: 28,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: 2,
                    fontFamily: 'cursive',
                    fontSize: 15,
                    color: '#3730a3',
                    fontStyle: 'italic',
                  }}
                >
                  {name}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {title}
                </div>
              </div>
            ))}
          </div>

          {/* Right: QR code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <QRCodeSVG
              value={verifyUrl}
              size={72}
              fgColor="#4f46e5"
              bgColor="transparent"
              level="M"
            />
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.5, textAlign: 'center' }}>
              Scan to verify
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent strip */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'linear-gradient(90deg, #2563eb, #7c3aed, #4f46e5)',
          borderRadius: '0 0 20px 20px',
        }}
      />
    </div>
  );
});

export default Certificate;
