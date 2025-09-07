
"use client";

import React from "react";
import { useFormContext, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { User, Baby, Copy } from 'lucide-react';
import { WomanIcon } from '@/components/icons';
import { Button } from "../ui/button";

type PassengerFieldsProps = {
  form: any;
  index: number;
  onCopyToAll?: () => void;
  memberCount?: number;
};

function PassengerFieldsComponent({ form, index, onCopyToAll, memberCount = 1 }: PassengerFieldsProps) {
  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <Label className="font-bold">Passenger {index + 1}</Label>
        {index === 0 && memberCount > 1 && onCopyToAll && (
            <Button type="button" size="sm" variant="outline" onClick={onCopyToAll} className="gap-1 text-xs">
                <Copy size={12}/>
                Copy to all
            </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormField
          control={form.control}
          name={`passengers.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
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
              <FormMessage />
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
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`passengers.${index}.gender`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="male" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center gap-1">
                      <User size={16} /> Male
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="female" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center gap-1">
                      <WomanIcon className="h-4 w-4" /> Female
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="child" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center gap-1">
                      <Baby size={16} /> Child
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export const PassengerFields = React.memo(PassengerFieldsComponent);

    