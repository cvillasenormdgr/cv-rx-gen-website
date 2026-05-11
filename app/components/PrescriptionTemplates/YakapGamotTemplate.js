// lib/prescriptionTemplate.js
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    padding: 24,
    paddingBottom: 120,
    fontSize: 12,
  },

  // Logo header
  logoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  logoImg: {
    width: 150,
    objectFit: 'contain',
  },

  // Prescription header grid
  prescriptionHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: 8,
  },
  prescriptionHeaderItem: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 6,      // ← vertical gap between rows
    paddingHorizontal: 4,
    fontSize: 12,
  },
  prescriptionHeaderStrong: {
    fontWeight: 700,
  },
  prescriptionHeaderSpan: {
    textAlign: 'right',
  },

  // Divider
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    marginVertical: 8,
  },

  // Rx title
  rxTitle: {
    fontSize: 48,
    fontWeight: 500,
    textAlign: 'left',
    marginBottom: 8,
  },

  // Message box
  messageBox: {
    backgroundColor: 'rgba(13, 109, 110, 0.1)',
    borderLeftWidth: 8,
    borderLeftColor: '#0D6D6E',
    padding: 16,
    marginBottom: 8,
  },
  messageBoxText: {
    fontWeight: 300,
    fontSize: 11,
  },

  // Medicine list
  medContainer: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    marginTop: 8,
  },
  medItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  medTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#111',
  },
  medQty: {
    fontSize: 11,
    color: '#333',
    fontWeight: 500,
  },
  medSigna: {
    marginTop: 4,
    fontSize: 11,
    fontStyle: 'italic',
    color: '#555',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
    paddingHorizontal: 40,
  },
  footerText: {
    flexDirection: 'column',
    gap: 2,
    width: '60%'
  },
  footerItem: {
    flexDirection: 'row',
    gap: 4,
    fontSize: 11,
  },
  footerItemStrong: {
    fontWeight: 700,
  },
  footerBrand: {
    color: '#0D6D6E',
    fontWeight: 700,
    marginTop: 4,
  },
  footerAddress: {
    fontSize: 10,
    color: '#333',
  },
  footerImg: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '30%',
  },
  footerSignature: {
    width: 150,
    objectFit: 'contain',
  },
});

export const YakapGamotTemplate = ({ medicines, patientName, doctorName, specialization, consultDate, birthday, sex, prcNo, ptrNo }) => (
  <Page size="A4" style={styles.page}>
    {/* Logo Header */}
    <View style={styles.logoHeader}>
      <Image
        style={styles.logoImg}
        src="https://cdn.healthtechalpha.com/static/resized/social_media_image/startup_data_images/34054.png"
      />
      <Image
        style={styles.logoImg}
        src="https://cv-rx-gen-website.vercel.app/PhilHealth%20YAKAP%20Logo%202.png"
      />
    </View>

    {/* Prescription Header */}
    <View style={styles.prescriptionHeader}>
      <View style={styles.prescriptionHeaderItem}>
        <Text style={styles.prescriptionHeaderStrong}>Patient:</Text>
        <Text style={styles.prescriptionHeaderSpan}>{patientName ?? 'TEST DO NOT PROCESS'}</Text>
      </View>
      <View style={styles.prescriptionHeaderItem}>
        <Text style={styles.prescriptionHeaderStrong}>Consultation Date:</Text>
        <Text style={styles.prescriptionHeaderSpan}>{consultDate ?? 'TEST DO NOT PROCESS'}</Text>
      </View>
      <View style={styles.prescriptionHeaderItem}>
        <Text style={styles.prescriptionHeaderStrong}>Birthday:</Text>
        <Text style={styles.prescriptionHeaderSpan}>{birthday ?? 'TEST DO NOT PROCESS'}</Text>
      </View>
      <View style={styles.prescriptionHeaderItem}>
        <Text style={styles.prescriptionHeaderStrong}>Sex:</Text>
        <Text style={styles.prescriptionHeaderSpan}>{sex ?? 'TEST DO NOT PROCESS'}</Text>
      </View>
    </View>

    {/* Divider */}
    <View style={styles.divider} />

    {/* Rx Title */}
    <Text style={styles.rxTitle}>Rx</Text>

    {/* Message Box */}
    <View style={styles.messageBox}>
      <Text style={styles.messageBoxText}>
        Please note that this prescription is for informational purposes only. It is not a medical prescription and should not be used as such.
      </Text>
    </View>

    {/* Medicine List */}
    <View style={styles.medContainer}>
      {medicines?.map((m, i) => (
        <View key={i} style={styles.medItem}>
          <View style={styles.medHeader}>
            <Text style={styles.medTitle}>{m.name}</Text>
            <Text style={styles.medQty}>#{m.quantity}</Text>
          </View>
          <Text style={styles.medSigna}>Signa: {m.sig}</Text>
        </View>
      ))}
    </View>

    {/* Footer */}
    <View style={styles.footer} fixed>
      <View style={styles.footerText}>
        <View style={styles.footerItem}>
          <Text style={styles.footerItemStrong}>Doctor: </Text>
          <Text>{doctorName ?? 'TEST DO NOT PROCESS'}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerItemStrong}>Specialization: </Text>
          <Text>{specialization ?? 'TEST DO NOT PROCESS'}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerItemStrong}>PRC Number: </Text>
          <Text>{prcNo ?? 'TEST DO NOT PROCESS'}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerItemStrong}>PTR Number: </Text>
          <Text>{ptrNo ?? 'TEST DO NOT PROCESS'}</Text>
        </View>
        <View style={{ marginTop: 8 }}>
          <Text style={styles.footerItem}>For any further clarifications or assistance, please contact us at info@medgrocer.com</Text>
        </View>
        <Text style={styles.footerBrand}>MG HEALTH SOLUTIONS INC.</Text>
        <Text style={styles.footerAddress}>24F Centuria Medical Makati, Kalayaan cor. Salamanca St.,</Text>
        <Text style={styles.footerAddress}>Poblacion, Makati, 1210, Metro Manila</Text>
      </View>
      <View style={styles.footerImg}>
        <Image
          style={styles.footerSignature}
          src="https://cv-rx-gen-website.vercel.app/image.png" // ← replace with absolute URL or base64
        />
      </View>
    </View>
  </Page>
);