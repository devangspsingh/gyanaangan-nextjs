import AttendanceVerificationClient from '@/components/event/AttendanceVerificationClient';

export const metadata = {
    title: 'Verify Attendance | GyanAangan',
    description: 'Verify event attendance certificate',
};

export default function AttendanceVerificationPage({ params }) {
    return <AttendanceVerificationClient registrationId={params.registration_id} />;
}
