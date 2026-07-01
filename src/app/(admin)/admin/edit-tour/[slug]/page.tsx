
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getTourPackageBySlug, createOrUpdateTourPackage, deleteTourPackage } from '@/lib/firebase';
import { revalidateTours } from '@/app/actions';
import type { TourPackage } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const itineraryItemSchema = z.object({
  time: z.string().min(1, "Time is required."),
  activity: z.string().min(1, "Activity is required."),
  description: z.string().min(1, "Description is required."),
  iconName: z.string().optional(),
});

const faqItemSchema = z.object({
  question: z.string().min(1, "Question is required."),
  answer: z.string().min(1, "Answer is required."),
});

const tourPackageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters."),
  slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  duration: z.string().min(1, "Duration is required."),
  overview: z.string().min(10, "Overview must be at least 10 characters."),
  inclusions: z.array(z.string()).min(1, "At least one inclusion is required."),
  exclusions: z.array(z.string()).min(1, "At least one exclusion is required."),
  notes: z.array(z.string()).min(1, "At least one note is required."),
  disclaimers: z.array(z.string()).min(1, "At least one disclaimer is required."),
  itinerary: z.array(itineraryItemSchema),
  faqs: z.array(faqItemSchema),
});

type TourFormValues = z.infer<typeof tourPackageSchema>;

export default function EditTourPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const slug = params.slug as string;
  const isNewTour = slug === 'new';

  const [tour, setTour] = useState<TourPackage | null>(null);
  const [loading, setLoading] = useState(!isNewTour);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourPackageSchema),
    defaultValues: {
      name: '',
      slug: '',
      price: 0,
      duration: '',
      overview: '',
      inclusions: [''],
      exclusions: [''],
      notes: [''],
      disclaimers: [''],
      itinerary: [{ time: '', activity: '', description: '', iconName: 'Bus' }],
      faqs: [{ question: '', answer: '' }],
    },
  });

  const { fields: itineraryFields, append: appendItinerary, remove: removeItinerary } = useFieldArray({ control: form.control, name: "itinerary" });
  const { fields: faqsFields, append: appendFaq, remove: removeFaq } = useFieldArray({ control: form.control, name: "faqs" });
  const { fields: inclusionsFields, append: appendInclusion, remove: removeInclusion } = useFieldArray({ control: form.control, name: "inclusions" });
  const { fields: exclusionsFields, append: appendExclusion, remove: removeExclusion } = useFieldArray({ control: form.control, name: "exclusions" });
  const { fields: notesFields, append: appendNote, remove: removeNote } = useFieldArray({ control: form.control, name: "notes" });
  const { fields: disclaimersFields, append: appendDisclaimer, remove: removeDisclaimer } = useFieldArray({ control: form.control, name: "disclaimers" });


  useEffect(() => {
    if (isNewTour) return;

    const fetchTour = async () => {
      setLoading(true);
      try {
        const tourData = await getTourPackageBySlug(slug);
        if (tourData) {
          setTour(tourData as TourPackage);
          form.reset({
            ...tourData,
            // Ensure array fields are not empty for the form
            inclusions: tourData.inclusions?.length > 0 ? tourData.inclusions : [''],
            exclusions: tourData.exclusions?.length > 0 ? tourData.exclusions : [''],
            notes: tourData.notes?.length > 0 ? tourData.notes : [''],
            disclaimers: tourData.disclaimers?.length > 0 ? tourData.disclaimers : [''],
          });
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Tour not found.' });
          setTour(null);
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch tour details.' });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [slug, isNewTour, toast, form]);

  const onSubmit = async (data: TourFormValues) => {
    setIsSubmitting(true);
    
    // Filter out empty strings from array fields
    const cleanedData = {
        ...data,
        inclusions: data.inclusions.filter(item => item.trim() !== ''),
        exclusions: data.exclusions.filter(item => item.trim() !== ''),
        notes: data.notes.filter(item => item.trim() !== ''),
        disclaimers: data.disclaimers.filter(item => item.trim() !== ''),
    };

    try {
      await createOrUpdateTourPackage(cleanedData);
      await revalidateTours();
      toast({ title: 'Success', description: `Tour package '${data.name}' has been ${isNewTour ? 'created' : 'updated'}.` });
      router.push('/admin/tours');
      router.refresh(); // To reflect changes in the admin table
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save tour package.' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isNewTour || !tour) return;
    setIsSubmitting(true);
    try {
        await deleteTourPackage(slug);
        await revalidateTours();
        toast({ title: 'Success', description: 'Tour package deleted.' });
        router.push('/admin/tours');
        router.refresh();
    } catch(e) {
        toast({ variant: "destructive", title: "Error", description: "Could not delete tour."});
        setIsSubmitting(false);
    }
  }
  
  if (loading) {
      return (
          <div className="flex justify-center items-center h-screen">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const renderArrayField = (
    title: string,
    fieldKey: 'inclusions' | 'exclusions' | 'notes' | 'disclaimers',
    fields: any[],
    remove: (index: number) => void,
    append: (value: any) => void
  ) => (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="font-semibold text-lg">{title}</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <FormField
            control={form.control}
            name={`${fieldKey}.${index}`}
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append('')}>
        <PlusCircle className="mr-2" /> Add {title.slice(0, -1)}
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl py-12">
        <Button variant="outline" onClick={() => router.push('/admin')} className="mb-4">
            <ArrowLeft className="mr-2"/> Back to Admin
        </Button>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{isNewTour ? 'Create New Tour' : 'Edit Tour'}</CardTitle>
              <CardDescription>{isNewTour ? 'Fill out the details for your new tour package.' : `Editing: ${tour?.name}`}</CardDescription>
            </div>
            {!isNewTour && tour && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive"><Trash2 className="mr-2"/> Delete Tour</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the "{tour.name}" tour package.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Tour Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem><FormLabel>Slug (URL Identifier)</FormLabel><FormControl><Input {...field} disabled={!isNewTour} /></FormControl><FormDescription>URL-friendly, no spaces, e.g., "my-new-tour"</FormDescription><FormMessage /></FormItem>
              )} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Base Price (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem><FormLabel>Duration</FormLabel><FormControl><Input {...field} placeholder="e.g., 9 Hours" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="overview" render={({ field }) => (
                <FormItem><FormLabel>Overview</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              {renderArrayField("Inclusions", "inclusions", inclusionsFields, removeInclusion, () => appendInclusion(""))}
              {renderArrayField("Exclusions", "exclusions", exclusionsFields, removeExclusion, () => appendExclusion(""))}
              {renderArrayField("Notes", "notes", notesFields, removeNote, () => appendNote(""))}
              {renderArrayField("Disclaimers", "disclaimers", disclaimersFields, removeDisclaimer, () => appendDisclaimer(""))}

             <div className="space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg">Itinerary</h3>
                {itineraryFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 bg-muted/50">
                        <Label>Stop {index + 1}</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name={`itinerary.${index}.time`} render={({ field }) => (<FormItem><FormLabel>Time</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name={`itinerary.${index}.activity`} render={({ field }) => (<FormItem><FormLabel>Activity</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name={`itinerary.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`itinerary.${index}.iconName`} render={({ field }) => (<FormItem><FormLabel>Icon Name (from lucide-react) (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeItinerary(index)} disabled={itineraryFields.length <= 1}><Trash2 className="mr-2"/> Remove Stop</Button>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => appendItinerary({ time: '', activity: '', description: '', iconName: 'Bus' })}><PlusCircle className="mr-2"/>Add Itinerary Stop</Button>
            </div>
            
             <div className="space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg">FAQs</h3>
                {faqsFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 bg-muted/50">
                         <Label>FAQ {index + 1}</Label>
                         <FormField control={form.control} name={`faqs.${index}.question`} render={({ field }) => (<FormItem><FormLabel>Question</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name={`faqs.${index}.answer`} render={({ field }) => (<FormItem><FormLabel>Answer</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                         <Button type="button" variant="destructive" size="sm" onClick={() => removeFaq(index)} disabled={faqsFields.length <= 1}><Trash2 className="mr-2"/> Remove FAQ</Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendFaq({ question: '', answer: '' })}><PlusCircle className="mr-2"/>Add FAQ</Button>
            </div>


              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isNewTour ? 'Create Tour' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
