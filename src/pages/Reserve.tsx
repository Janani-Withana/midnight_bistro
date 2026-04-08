import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Users, Check } from "lucide-react";
import { postReservation } from "@/lib/api";

const Reserve = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "",
    occasion: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await postReservation({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        guests: formData.guests,
        occasion: formData.occasion || undefined,
        notes: formData.notes || undefined,
      });
      setIsSubmitted(true);
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Failed to submit reservation. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isSubmitted) {
    return (
      <MainLayout>
        <section className="min-h-screen flex items-center justify-center px-6 py-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-primary/10 border border-primary flex items-center justify-center mx-auto mb-8"
            >
              <Check className="w-10 h-10 text-primary" />
            </motion.div>
            <h2 className="font-display text-4xl text-foreground mb-4">
              Reservation Confirmed
            </h2>
            <p className="text-muted-foreground mb-8">
              Thank you for choosing Ember. We've sent a confirmation to your
              email and look forward to welcoming you.
            </p>
            <Button
              variant="elegant"
              size="lg"
              onClick={() => setIsSubmitted(false)}
            >
              Make Another Reservation
            </Button>
          </motion.div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-primary tracking-[0.3em] uppercase text-sm mb-4">
              Join Us
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-foreground mb-6">
              Reserve a Table
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Secure your place for an unforgettable evening of culinary
              artistry.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Reservation Form */}
      <section className="pb-24 px-6">
        <div className="container mx-auto max-w-2xl">
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border/20 rounded-lg p-8 md:p-12"
          >
            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-4 mb-10 pb-10 border-b border-border/30">
              {[
                { icon: Calendar, label: "Tue-Sat" },
                { icon: Clock, label: "5pm-12am" },
                { icon: Users, label: "2-8 Guests" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center text-center"
                >
                  <item.icon className="w-5 h-5 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-xs tracking-wider uppercase text-muted-foreground"
                  >
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-background border-border/50 focus:border-primary h-12"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-xs tracking-wider uppercase text-muted-foreground"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-background border-border/50 focus:border-primary h-12"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-xs tracking-wider uppercase text-muted-foreground"
                >
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="bg-background border-border/50 focus:border-primary h-12"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Date, Time, Guests */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="date"
                    className="text-xs tracking-wider uppercase text-muted-foreground"
                  >
                    Date
                  </label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="bg-background border-border/50 focus:border-primary h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="time"
                    className="text-xs tracking-wider uppercase text-muted-foreground"
                  >
                    Time
                  </label>
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full h-12 rounded-md border border-border/50 bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select time</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="17:30">5:30 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="18:30">6:30 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="19:30">7:30 PM</option>
                    <option value="20:00">8:00 PM</option>
                    <option value="20:30">8:30 PM</option>
                    <option value="21:00">9:00 PM</option>
                    <option value="21:30">9:30 PM</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="guests"
                    className="text-xs tracking-wider uppercase text-muted-foreground"
                  >
                    Guests
                  </label>
                  <select
                    id="guests"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    required
                    className="w-full h-12 rounded-md border border-border/50 bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select guests</option>
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5 Guests</option>
                    <option value="6">6 Guests</option>
                    <option value="7">7 Guests</option>
                    <option value="8">8 Guests</option>
                  </select>
                </div>
              </div>

              {/* Occasion */}
              <div className="space-y-2">
                <label
                  htmlFor="occasion"
                  className="text-xs tracking-wider uppercase text-muted-foreground"
                >
                  Special Occasion (Optional)
                </label>
                <select
                  id="occasion"
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                  className="w-full h-12 rounded-md border border-border/50 bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select occasion</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="date">Date Night</option>
                  <option value="business">Business Dinner</option>
                  <option value="celebration">Celebration</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label
                  htmlFor="notes"
                  className="text-xs tracking-wider uppercase text-muted-foreground"
                >
                  Special Requests (Optional)
                </label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="bg-background border-border/50 focus:border-primary min-h-[120px] resize-none"
                  placeholder="Dietary restrictions, seating preferences, allergies..."
                />
              </div>

              {submitError && (
                <p className="text-sm text-destructive font-body">{submitError}</p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Confirm Reservation"}
              </Button>
            </div>
          </motion.form>

          {/* Contact Alternative */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center text-muted-foreground text-sm mt-8"
          >
            For parties larger than 8 or private events, please call us at{" "}
            <a href="tel:+15552345678" className="text-primary hover:underline">
              +1 (555) 234-5678
            </a>
          </motion.p>
        </div>
      </section>
    </MainLayout>
  );
};

export default Reserve;
