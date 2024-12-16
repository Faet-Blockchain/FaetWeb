
import RoadmapAnimation from "@/components/roadmap/RoadmapAnimation";
import GuideLine from "@/components/home/GuideLine";

export default function PrivacyPolicy() {
    return (
        <RoadmapAnimation>
                <div className="container mx-auto my-10 p-4">
                <br />
                <br />
                <br />
                <br />
                <br />
                <h1 className="text-3xl font-bold mb-6">FAET.IO PRIVACY POLICY</h1>
                <p className="mb-6">Last Updated: <strong>December 13, 2024</strong></p>
                <p className="mb-4">
                    At Faet.io (“Faet,” “we,” “our,” or “us”), we value your privacy. This Privacy Policy outlines how we
                    collect, use, and protect the minimal data we gather when you interact with our platform. By accessing
                    or using Faet.io (the “Service”), you agree to the practices described in this Privacy Policy. If you do
                    not agree, please discontinue use of the Service.
                </p>

                <h2 className="text-2xl font-semibold mb-4">1. INFORMATION WE COLLECT</h2>
                <p className="mb-4">
                    We collect only the information necessary to operate and improve the Service. This includes:
                </p>
                <p className="mb-4">
                    <strong>1.1 Non-Personally Identifiable Information (Non-PII)</strong>
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>Browser Data: Information about your browser type, operating system, and device.</li>
                    <li>Usage Data: Pages viewed, time spent on the platform, and general activity patterns.</li>
                </ul>
                <p className="mb-4">
                    <strong>1.2 Wallet Information</strong>
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>Public Wallet Address: Collected to enable blockchain interactions and provide analytics related to
                        wallet activity.</li>
                    <li>Transaction Data: Public blockchain activity associated with your wallet address.</li>
                </ul>
                <p className="mb-4">
                    Note: Public wallet addresses and blockchain data are not considered PII under most privacy regulations
                    because they do not directly identify an individual.
                </p>

                <h2 className="text-2xl font-semibold mb-4">2. HOW WE USE YOUR INFORMATION</h2>
                <p className="mb-4">
                    The data we collect is used for the following purposes:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>Platform Analytics: Understanding user behavior to improve functionality and user experience.</li>
                    <li>Security: Monitoring activity to detect and prevent fraudulent or malicious behavior.</li>
                    <li>Blockchain Transactions: Facilitating interactions with supported blockchains.</li>
                </ul>
                <p className="mb-4">
                    We do not use your data for targeted advertising or sell your data to third parties.
                </p>

                <h2 className="text-2xl font-semibold mb-4">3. DATA DISCLOSURE</h2>
                <p className="mb-4">
                    We may share data in the following circumstances:
                </p>
                <p className="mb-4">
                    <strong>3.1 Public Blockchain Data:</strong> Transactions conducted on supported blockchains are
                    publicly available and not within our control.
                </p>
                <p className="mb-4">
                    <strong>3.2 Service Providers:</strong> We may use third-party tools for analytics (e.g., Google
                    Analytics) or hosting services. These providers process data in accordance with their own privacy
                    policies.
                </p>
                <p className="mb-4">
                    <strong>3.3 Legal Obligations:</strong> We may disclose data if required to comply with applicable laws
                    or legal processes.
                </p>

                <h2 className="text-2xl font-semibold mb-4">4. YOUR RIGHTS</h2>
                <p className="mb-4">
                    Depending on your jurisdiction, you may have the following rights regarding your data:
                </p>
                <p className="mb-4">
                    <strong>4.1 Access and Review:</strong> You can request access to the limited data we collect about your
                    usage.
                </p>
                <p className="mb-4">
                    <strong>4.2 Deletion:</strong> You may request that we delete any browser or wallet-related analytics
                    data we retain. Public blockchain data cannot be altered or deleted.
                </p>
                <p className="mb-4">
                    <strong>4.3 Opt-Out:</strong> You can disable cookies or analytics tracking through your browser
                    settings.
                </p>

                <h2 className="text-2xl font-semibold mb-4">5. DATA SECURITY</h2>
                <p className="mb-4">
                    We implement industry-standard security measures to protect the data we collect. However, no system is
                    completely secure. You are responsible for safeguarding your wallet credentials and private keys.
                </p>

                <h2 className="text-2xl font-semibold mb-4">6. COOKIES AND TRACKING</h2>
                <p className="mb-4">
                    <strong>6.1 Use of Cookies:</strong> We use cookies and similar technologies to:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>Analyze platform usage.</li>
                    <li>Enhance functionality and user experience.</li>
                </ul>
                <p className="mb-4">
                    <strong>6.2 Managing Cookies:</strong> You can disable cookies through your browser settings. Disabling
                    cookies may impact certain features of the Service.
                </p>

                <h2 className="text-2xl font-semibold mb-4">7. BLOCKCHAIN DATA NOTICE</h2>
                <p className="mb-4">
                    Transactions and wallet activities conducted on blockchain networks are immutable, public, and
                    accessible to anyone. Faet.io cannot control or delete data published on the blockchain.
                </p>

                <h2 className="text-2xl font-semibold mb-4">8. INTERNATIONAL USERS</h2>
                <p className="mb-4">
                    Our platform is hosted in the United States and intended for users globally. By accessing the Service,
                    you consent to the transfer and processing of your data in the United States or other countries where we
                    or our providers operate.
                </p>

                <h2 className="text-2xl font-semibold mb-4">9. CHILDREN’S PRIVACY</h2>
                <p className="mb-4">
                    The Service is not intended for individuals under the age of 18. We do not knowingly collect data from
                    children. If we learn that we have inadvertently collected data from a child, we will delete it
                    promptly.
                </p>

                <h2 className="text-2xl font-semibold mb-4">10. CHANGES TO THIS PRIVACY POLICY</h2>
                <p className="mb-4">
                    We may update this Privacy Policy from time to time to reflect changes in our practices or legal
                    requirements. Updates will be posted on this page with a revised “Last Updated” date.
                </p>

                <h2 className="text-2xl font-semibold mb-4">11. CONTACT US</h2>
                <p className="mb-4">
                    If you have any questions about this agreement, please contact us using the contact form on our
                    website.
                </p>
            </div>
            <GuideLine />
        </RoadmapAnimation>
    );
}
