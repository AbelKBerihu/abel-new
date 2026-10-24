import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay } from "date-fns";
import { Phone, Send, Loader2 } from "lucide-react";
import { contactFormSchema, type ContactFormValues } from "./schema";

interface ContactFormProps {
  onSubmit: (data: ContactFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  isMobile: boolean;
}

export const ContactForm = ({ onSubmit, isSubmitting, isMobile }: ContactFormProps) => {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", phone: "", projectNeeds: "", message: "", preferredDate: undefined },
  });
  const selected = form.watch("preferredDate");

  const submit = async (data: ContactFormValues) => {
    if (await onSubmit(data)) form.reset();
  };

  const fieldClass = "bg-background/60 border-border focus-visible:ring-primary";

  return (
    <Form {...form}>
      <div className="flex flex-col md:flex-row gap-8">
        <form onSubmit={form.handleSubmit(submit)} className="flex-1 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormControl><Input placeholder="Your Name" className={fieldClass} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormControl><Input type="email" placeholder="Email Address" className={fieldClass} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormControl>
              <div className="relative">
                <Input type="tel" placeholder="Phone Number" className={`${fieldClass} pl-9`} {...field} />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="projectNeeds" render={({ field }) => (
            <FormItem>
              <FormLabel className="editorial-kicker">Project needs (optional)</FormLabel>
              <FormControl><Textarea placeholder="Goals, features, timeline, budget…" className={`${fieldClass} min-h-[100px]`} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="message" render={({ field }) => (
            <FormItem><FormControl><Textarea placeholder="Your Message" className={`${fieldClass} min-h-[110px]`} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <Button type="submit" disabled={isSubmitting} className="w-full font-semibold transition-transform active:scale-[0.98]">
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : !isMobile && <Send className="w-4 h-4 mr-2" />}
            {isSubmitting ? "Sending & drafting brief…" : "Send Message"}
          </Button>
        </form>

        <div className="w-full md:w-[340px] rounded-lg border border-border bg-card p-4 flex flex-col items-center">
          <h3 className="text-base font-semibold mb-2 text-center">Select a Date</h3>
          <p className="text-sm text-muted-foreground mb-2 text-center">
            {selected ? <>Selected: <span className="text-primary">{format(selected, "PPP")}</span></> : "Pick a day to get in touch"}
          </p>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => d && form.setValue("preferredDate", d, { shouldValidate: true })}
            disabled={(d) => d < startOfDay(new Date())}
            className="rounded-md border border-border pointer-events-auto"
          />
          {form.formState.errors.preferredDate && (
            <p className="text-sm text-destructive mt-2">{form.formState.errors.preferredDate.message}</p>
          )}
        </div>
      </div>
    </Form>
  );
};
