import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, MapPin, Download, Github, Linkedin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { z } from "zod";

type ContactFormData = z.infer<typeof insertContactMessageSchema>;

export default function ContactSection() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(insertContactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: t.contact.successTitle,
        description: t.contact.successDescription,
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: t.contact.errorTitle,
        description: t.contact.errorDescription,
        variant: "destructive",
      });
    },
  });

  const handleDownloadResume = async () => {
    try {
      const response = await fetch("/api/resume/download");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'israel-soto-resume.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: t.contact.resumeSuccessTitle,
          description: t.contact.resumeSuccessDescription,
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      toast({
        title: t.contact.resumeErrorTitle,
        description: t.contact.resumeErrorDescription,
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4" data-testid="contact-title">
            {t.contact.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-bold text-primary-800 mb-6">{t.contact.getInTouchTitle}</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4" data-testid="contact-email">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Mail className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium text-primary-800">{t.contact.emailLabel}</div>
                  <div className="text-gray-600">israel.soto@muuyal.tech</div>
                </div>
              </div>
              <div className="flex items-center space-x-4" data-testid="contact-linkedin">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Linkedin className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium text-primary-800">{t.contact.linkedinLabel}</div>
                  <div className="text-gray-600">linkedin.com/in/israel-soto-923649b8</div>
                </div>
              </div>
              <div className="flex items-center space-x-4" data-testid="contact-github">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Github className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium text-primary-800">{t.contact.githubLabel}</div>
                  <div className="text-gray-600">github.com/isoto-muuyal</div>
                </div>
              </div>
              <div className="flex items-center space-x-4" data-testid="contact-location">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MapPin className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium text-primary-800">{t.contact.locationLabel}</div>
                  <div className="text-gray-600">{t.contact.locationValue}</div>
                </div>
              </div>
            </div>

            {/* Resume Download */}
            <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-primary-800 mb-3">{t.contact.resumeTitle}</h4>
              <p className="text-gray-600 mb-4">{t.contact.resumeDescription}</p>
              <Button
                onClick={handleDownloadResume}
                className="inline-flex items-center space-x-2"
                data-testid="button-download-resume"
              >
                <Download className="w-4 h-4" />
                <span>{t.contact.downloadResume}</span>
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-primary-800 mb-6">{t.contact.sendMessageTitle}</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.contact.nameLabel}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t.contact.namePlaceholder}
                          data-testid="input-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.contact.emailLabel}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t.contact.emailPlaceholder}
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.contact.subjectLabel}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t.contact.subjectPlaceholder}
                          data-testid="input-subject"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.contact.messageLabel}</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder={t.contact.messagePlaceholder}
                          className="resize-none"
                          data-testid="textarea-message"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={contactMutation.isPending}
                  data-testid="button-send-message"
                >
                  {contactMutation.isPending ? t.contact.sendingButton : t.contact.sendButton}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
