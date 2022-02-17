export interface DecodedCalldata {
  signature: string;
  functionFragment: { inputs: { type: string; name: string }[] };
  args: any[];
}
