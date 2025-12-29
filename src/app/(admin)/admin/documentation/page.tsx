
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, FileText } from 'lucide-react';

const CodeBlock = ({ code, lang = 'tsx' }: { code: string, lang?: string }) => (
    <pre className={`bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm font-mono language-${lang}`}>
        <code>{code.trim()}</code>
    </pre>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section className="mb-12">
        <h2 className="text-3xl font-bold font-headline border-b-2 border-primary pb-2 mb-6">{title}</h2>
        <div className="space-y-6 text-base leading-relaxed text-muted-foreground">{children}</div>
    </section>
);

const SubSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4">{title}</h3>
        <div className="space-y-4 ml-4 border-l-2 border-border pl-6">{children}</div>
    </div>
);


const ColorSwatch = ({ name, hsl, hex, className }: { name: string, hsl: string, hex: string, className: string }) => (
    <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${className}`}></div>
        <div>
            <p className="font-semibold">{name}</p>
            <p className="text-sm font-mono">{hsl}</p>
            <p className="text-sm font-mono">{hex}</p>
        </div>
    </div>
);


export default function DocumentationPage() {
    const firebaseConfigCode = `
const firebaseConfig = {
  projectId: 'nilgiri-explorer',
  appId: '1:379536738400:web:019de38a8bb5025ab7db05',
  storageBucket: 'nilgiri-explorer.appspot.com',
  apiKey: 'AIzaSyDAZjWPRX1pbM0CAC4QlZlH9eWBksqluE4',
  authDomain: 'nil-explorer.firebaseapp.com',
  messagingSenderId: '379536738400',
};
    `;

    const getTourPackagesCode = `
export const getTourPackages = async (): Promise<TourPackage[]> => {
    const tourPackagesCol = collection(db, 'tour_packages');
    const snapshot = await getDocs(tourPackagesCol);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({...doc.data(), id: doc.id } as TourPackage));
}
    `;
    
    const saveBookingCode = `
export const saveBooking = async (bookingData: Omit<Booking, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    return docRef.id;
  } catch (e) {
    throw new Error('Could not save booking');
  }
};
    `;

     const bookingPageStructure = `
- BookingFlow (Main client component)
  - Manages the multi-step booking process (1. Details, 2. Passengers/Seats, 3. Payment).
  - Uses React Hook Form for validation.
  - State managed with 'useState' for step, selected seats, etc.
  - Fetches availability using a Server Action.
- Server Actions ('./actions.ts')
  - createPaymentOrder: Communicates with Razorpay to create an order.
  - saveSuccessfulBooking: Saves the final booking to Firestore.
  - getAvailabilityForDate: Fetches seat availability from Firestore.
- Razorpay Integration
  - A <Script> tag loads the Razorpay checkout library.
  - On payment, the 'handler' function is called to save the booking.
    `;
    
    const adminPageStructure = `
- AdminLayout ('/admin/layout.tsx'): Wraps all admin pages, provides navigation.
- AdminPage ('/admin/page.tsx'): The main dashboard, composed of several server components.
- Management Components (e.g., 'TourManagement', 'BookingsManagement'): Server components that fetch data and pass it to client components for display/interaction.
- Form Components (e.g., 'EditTourPage', 'PriceForm'): Client components using React Hook Form for data mutation via Server Actions.
    `;

    return (
        <div className="container mx-auto max-w-5xl py-12">
            <header className="text-center mb-12">
                <div className="flex items-center justify-center gap-3">
                    <FileText className="w-12 h-12 text-primary"/>
                    <h1 className="text-5xl font-bold font-headline">Project Documentation</h1>
                </div>
                <p className="text-xl text-muted-foreground mt-4">A comprehensive technical guide for the Go Nilgris website.</p>
            </header>

            <Card className="p-6 md:p-10">
                <CardContent className="prose prose-lg max-w-none">
                    
                    <Section title="1. Architectural Overview">
                        <p>This project is a modern, full-stack web application built with Next.js, designed for a tour booking service called "Go Nilgris". It features a public-facing website for users to browse tours and make bookings, and a local-only admin panel for site management.</p>
                        
                        <SubSection title="Core Technologies">
                             <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Framework:</strong> Next.js 15 (App Router)</li>
                                <li><strong>Database:</strong> Google Firestore (NoSQL)</li>
                                <li><strong>Styling:</strong> Tailwind CSS with ShadCN UI components</li>
                                <li><strong>Payments:</strong> Razorpay Integration</li>
                                <li><strong>Deployment:</strong> Firebase App Hosting</li>
                                <li><strong>Language:</strong> TypeScript</li>
                            </ul>
                        </SubSection>

                         <SubSection title="Key Principles">
                             <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Server-First:</strong> Data fetching and rendering are primarily done on the server for optimal performance and SEO, using Next.js Server Components.</li>
                                <li><strong>Client-Side Interactivity:</strong> React client components are used for interactive elements like forms, seat charts, and navigation menus.</li>
                                <li><strong>Separated Concerns:</strong> The application code is logically separated between the user-facing site <code>(user)</code> and the admin panel <code>(admin)</code> using route groups.</li>
                                <li><strong>Secure by Default:</strong> The admin panel is configured to be available only in the local development environment, preventing any access in the live production deployment.</li>
                            </ul>
                        </SubSection>
                    </Section>

                     <Section title="2. Styling, Fonts & Theming">
                        <p>The visual identity of the website is managed through a combination of Tailwind CSS for utility-first styling and a customizable theme system.</p>
                        
                        <SubSection title="Typography & Font">
                            <p>The primary font used across the entire application is <strong>Inter</strong>. It's a clean, modern, and highly readable sans-serif font, imported via Google Fonts in the main layout files.</p>
                        </SubSection>

                        <SubSection title="Color Palette & Themes">
                            <p>The application uses a CSS variable-based theming system, defined in <code>src/app/globals.css</code>. This allows for dynamic theme switching. The default theme is a green-centric "Forest" theme.</p>
                            <p>Here are the key colors for the default light theme:</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                                <ColorSwatch name="Background" hsl="0 0% 100%" hex="#FFFFFF" className="bg-background border" />
                                <ColorSwatch name="Foreground" hsl="224 71% 4%" hex="#0A0A23" className="bg-foreground" />
                                <ColorSwatch name="Primary" hsl="122 41% 39%" hex="#3A8A53" className="bg-primary" />
                                <ColorSwatch name="Primary Foreground" hsl="120 100% 98%" hex="#F0FFF0" className="bg-primary-foreground border" />
                                <ColorSwatch name="Secondary" hsl="60 40% 90%" hex="#E8E8D9" className="bg-secondary" />
                                <ColorSwatch name="Accent" hsl="47 100% 69%" hex="#FFD700" className="bg-accent" />
                                <ColorSwatch name="Destructive" hsl="0 84.2% 60.2%" hex="#FC4444" className="bg-destructive" />
                             </div>
                        </SubSection>
                    </Section>

                    <Section title="3. Firebase & Database Operations">
                         <p>Google Firestore is the NoSQL database used to store all application data. All database interaction logic is centralized in <code>src/lib/firebase.ts</code> and exposed as server functions (Server Actions).</p>
                         <p>The Firebase project is configured in the same file:</p>
                         <CodeBlock code={firebaseConfigCode} lang="javascript" />
                         
                         <SubSection title="Data Collections Schema">
                            <ul className="list-disc pl-5 space-y-4">
                                <li>
                                    <strong><code>tour_packages</code></strong>
                                    <p className="text-sm">Stores the main details for each tour. The document ID is a URL-friendly slug.</p>
                                    <p className="text-sm font-mono">Schema: name, slug, duration, overview, inclusions, exclusions, notes, itinerary, faqs.</p>
                                </li>
                                <li>
                                    <strong><code>packages</code></strong>
                                    <p className="text-sm">Stores the price for each package, decoupled from the main tour data to allow for dynamic price updates.</p>
                                    <p className="text-sm font-mono">Schema: slug, price.</p>
                                </li>
                                <li>
                                    <strong><code>bookings</code></strong>
                                    <p className="text-sm">Contains a record for every successful booking made by a user.</p>
                                     <p className="text-sm font-mono">Schema: bookingId, packageSlug, bookingDate, passengers, selectedSeats, totalAmount, razorpayPaymentId, etc.</p>
                                </li>
                                <li>
                                    <strong><code>gallery</code></strong>
                                    <p className="text-sm">Stores URLs for images associated with each tour package.</p>
                                     <p className="text-sm font-mono">Schema: url, alt, packageSlug.</p>
                                </li>
                                <li>
                                    <strong><code>availability</code></strong>
                                    <p className="text-sm">Tracks seats that are manually blocked by an admin for a specific tour on a specific date.</p>
                                     <p className="text-sm font-mono">Schema: blockedSeats (array of numbers).</p>
                                </li>
                                 <li>
                                    <strong><code>site_config</code></strong>
                                    <p className="text-sm">Stores site-wide configuration data, like contact information.</p>
                                     <p className="text-sm font-mono">Schema: whatsapp, call.</p>
                                </li>
                            </ul>
                         </SubSection>

                        <SubSection title="Data Fetching (Reading Data)">
                            <p>Data is primarily fetched on the server within async Server Components. This is the most performant method in Next.js.</p>
                            <p>Example: Fetching all tour packages for the homepage.</p>
                            <CodeBlock code={getTourPackagesCode} lang="typescript" />
                        </SubSection>

                        <SubSection title="Data Mutation (Writing Data)">
                             <p>Data is written to the database using Server Actions, which are secure functions that run only on the server. These are called directly from client components (like forms).</p>
                             <p>Example: Saving a new booking after a successful payment.</p>
                             <CodeBlock code={saveBookingCode} lang="typescript" />
                        </SubSection>
                    </Section>

                     <Section title="4. Key Functionalities">
                        <SubSection title="User Booking Flow">
                            <p>This is the core user journey, handled primarily by the booking page located at <code>src/app/(user)/booking/page.tsx</code>.</p>
                            <CodeBlock code={bookingPageStructure} lang="text" />
                        </SubSection>
                         <SubSection title="Admin Panel Operations">
                            <p>The admin panel, located under <code>src/app/(admin)/</code>, is a collection of server and client components designed for site management. It's built to run only locally.</p>
                             <CodeBlock code={adminPageStructure} lang="text" />
                        </SubSection>
                    </Section>

                </CardContent>
            </Card>
        </div>
    );
}
