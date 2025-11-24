import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Corporate Palette
const colors = {
    primary: '#0f172a', // Dark Slate
    accent: '#6366f1',  // Indigo
    text: '#334155',    // Slate 700
    textLight: '#64748b', // Slate 500
    border: '#e2e8f0',
    white: '#ffffff',
    bgLight: '#f8fafc'
};

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
        position: 'relative',
    },
    // Decorative Border
    pageBorder: {
        position: 'absolute',
        top: 20, left: 20, right: 20, bottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
        zIndex: -1,
    },
    // Header
    header: {
        backgroundColor: colors.primary,
        height: 110,
        paddingHorizontal: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        width: 140,
        height: 'auto',
    },
    headerTitle: {
        color: colors.white,
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
        opacity: 0.9,
    },
    // Body
    body: {
        padding: 40,
    },
    // Title
    titleContainer: {
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: colors.accent,
        paddingBottom: 10,
        width: '100%',
    },
    subTitle: {
        fontSize: 12,
        color: colors.textLight,
        textTransform: 'uppercase',
        letterSpacing: 4,
        marginBottom: 5,
    },
    mainTitle: {
        fontSize: 34,
        color: colors.primary,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    // Participant Section (Centered)
    participantSection: {
        alignItems: 'center',
        marginBottom: 30,
        paddingVertical: 20,
        backgroundColor: colors.bgLight,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35, // Circular
        marginBottom: 10,
        objectFit: 'cover',
        borderWidth: 2,
        borderColor: colors.accent,
    },
    presentedText: {
        fontSize: 10,
        color: colors.textLight,
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    participantName: {
        fontSize: 24,
        color: colors.primary,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    collegeName: {
        fontSize: 12,
        color: colors.textLight,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    // Grid Details
    gridContainer: {
        flexDirection: 'row',
        gap: 30,
        marginBottom: 20,
    },
    column: {
        flex: 1,
    },
    detailBlock: {
        marginBottom: 15,
    },
    detailLabel: {
        fontSize: 8,
        color: colors.textLight,
        textTransform: 'uppercase',
        marginBottom: 3,
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 11,
        color: colors.text,
        fontFamily: 'Helvetica-Bold',
        lineHeight: 1.4,
    },
    // Org Header within Grid
    orgHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    orgLogo: {
        width: 24,
        height: 24,
        borderRadius: 4,
        marginRight: 8,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    qrCode: {
        width: 60,
        height: 60,
    },
    footerTextContainer: {
        marginLeft: 15,
        flex: 1,
    },
    footerBranding: {
        fontSize: 10,
        color: colors.primary,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2,
    },
    footerLegal: {
        fontSize: 8,
        color: colors.textLight,
        lineHeight: 1.3,
    },
    verifiedBadge: {
        position: 'absolute',
        top: 150,
        right: 40,
        opacity: 0.1,
        transform: 'rotate(-20deg)',
    },
    watermarkText: {
        fontSize: 60,
        fontWeight: 'bold',
        color: colors.accent,
    }
});

const AttendanceCertificatePDF = ({ verification, qrCodeDataUrl }) => {
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.pageBorder} />

                {/* 1. BRANDING HEADER */}
                <View style={styles.header}>
                    <Image
                        src="https://gyanaangan.in/images/logo%20white.png"
                        style={styles.logo}
                    />
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.headerTitle}>Official Certificate</Text>
                        <Text style={{ ...styles.headerTitle, fontSize: 8, marginTop: 4 }}>ID: {verification.registration_number}</Text>
                    </View>
                </View>

                <View style={styles.body}>
                    {/* Title */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.subTitle}>Certificate of Attendance</Text>
                        <Text style={styles.mainTitle}>Verified</Text>
                    </View>

                    {/* Watermark (Background Visual) */}
                    <View style={styles.verifiedBadge}>
                        <Text style={styles.watermarkText}>VERIFIED</Text>
                    </View>

                    {/* 2. PARTICIPANT SECTION WITH IMAGE */}
                    <View style={styles.participantSection}>
                        {verification.user_details.profile_pic_url && (
                            <Image
                                src={verification.user_details.profile_pic_url}
                                style={styles.profileImage}
                            />
                        )}
                        <Text style={styles.presentedText}>Proudly Presented To</Text>
                        <Text style={styles.participantName}>{verification.user_details.full_name}</Text>
                        {verification.user_details.student_profile?.college_name && (
                            <Text style={styles.collegeName}>{verification.user_details.student_profile.college_name}</Text>
                        )}
                    </View>

                    {/* Grid Content */}
                    <View style={styles.gridContainer}>
                        <View style={styles.column}>
                            {/* 3. ORGANIZER WITH IMAGE */}
                            <View style={styles.detailBlock}>
                                <Text style={styles.detailLabel}>Organized By</Text>
                                <View style={styles.orgHeader}>
                                    {verification.event_details.organization_details.logo && (
                                        <Image
                                            src={verification.event_details.organization_details.logo}
                                            style={styles.orgLogo}
                                        />
                                    )}
                                    <Text style={styles.detailValue}>
                                        {verification.event_details.organization_details.name}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailBlock}>
                                <Text style={styles.detailLabel}>Event Name</Text>
                                <Text style={styles.detailValue}>{verification.event_details.title}</Text>
                            </View>
                        </View>

                        <View style={styles.column}>
                            <View style={styles.detailBlock}>
                                <Text style={styles.detailLabel}>Date & Time</Text>
                                <Text style={styles.detailValue}>
                                    {formatDate(verification.event_details.start_datetime)}
                                </Text>
                                <Text style={{ ...styles.detailValue, fontSize: 9, marginTop: 2 }}>
                                    {formatTime(verification.event_details.start_datetime)}
                                </Text>
                            </View>

                            <View style={styles.detailBlock}>
                                <Text style={styles.detailLabel}>Marked Present At</Text>
                                <Text style={styles.detailValue}>
                                    {formatDate(verification.marked_present_at)} • {formatTime(verification.marked_present_at)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 4. FOOTER WITH BRANDING */}
                <View style={styles.footer}>
                    {qrCodeDataUrl && (
                        <Image src={qrCodeDataUrl} style={styles.qrCode} />
                    )}
                    <View style={styles.footerTextContainer}>
                        <Text style={styles.footerBranding}>Powered by GyanAangan</Text>
                        <Text style={styles.footerLegal}>
                            This certificate authenticates that the participant was physically/digitally present for the event.
                            Scan the QR code to view the live verification record.
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default AttendanceCertificatePDF;