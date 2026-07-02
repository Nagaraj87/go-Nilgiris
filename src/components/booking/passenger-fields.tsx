"use client";

import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useWatch } from 'react-hook-form';

type PassengerFieldsProps = {
  form: any;
  index: number;
};

function PassengerFieldsComponent({ form, index }: PassengerFieldsProps) {
  // Watch isForeign for this specific passenger using useWatch to trigger component re-render correctly
  const isForeign = useWatch({
    control: form.control,
    name: `passengers.${index}.isForeign`,
    defaultValue: false
  });

  return (
    <div className="space-y-4">
      {/* Row 1: Core details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name={`passengers.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`passengers.${index}.age`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`passengers.${index}.gender`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      {/* Row 2: Contact, Nationality & Conditional Email details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        {/* Contact Field */}
        <FormField
          control={form.control}
          name={`passengers.${index}.phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number {isForeign ? "(Intl)" : ""}</FormLabel>
              <FormControl>
                <Input 
                  type="tel" 
                  placeholder={isForeign ? "e.g., +15551234567" : "10-digit number"}
                  maxLength={isForeign ? 15 : 10}
                  {...field}
                  onChange={(e) => {
                    const filterRegex = isForeign ? /[^0-9+]/g : /[^0-9]/g;
                    const val = e.target.value.replace(filterRegex, '');
                    field.onChange(val);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Foreign Tourist Checkbox */}
        <FormField
          control={form.control}
          name={`passengers.${index}.isForeign`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-3 h-10 bg-background shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue(`passengers.${index}.email`, '');
                      // Automatically convert number to digits-only up to 10
                      const rawPhone = form.getValues(`passengers.${index}.phone`) || '';
                      form.setValue(`passengers.${index}.phone`, rawPhone.replace(/[^0-9]/g, '').slice(0, 10));
                    }
                  }}
                />
              </FormControl>
              <div className="space-y-0.5 leading-none">
                <FormLabel className="text-sm font-medium cursor-pointer">
                  Foreign Tourist
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Conditional Email Field */}
        {isForeign && (
          <FormField
            control={form.control}
            name={`passengers.${index}.email`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="passenger@example.com" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}

export const PassengerFields = React.memo(PassengerFieldsComponent);

