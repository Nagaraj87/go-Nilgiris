"use client";

import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormContext } from 'react-hook-form';

type PassengerFieldsProps = {
  form: any;
  index: number;
};

function PassengerFieldsComponent({ form, index }: PassengerFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Grid containing Name, Age, Gender, and Contact Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
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
        <FormField
          control={form.control}
          name={`passengers.${index}.phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input 
                  type="tel" 
                  placeholder="10-digit number"
                  maxLength={10}
                  {...field}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    field.onChange(val);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export const PassengerFields = React.memo(PassengerFieldsComponent);

