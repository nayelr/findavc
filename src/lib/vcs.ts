export interface VC {
  'Investor name': string;
  'Website': string;
  'Global HQ': string;
  'Countries of investment': string;
  'Stage of investment': string;
  'Investment thesis': string;
  'Investor type': string;
  'First cheque minimum': string;
  'First cheque maximum': string;
}

// Function to parse CSV text in the browser
function parseCSV(csv: string): VC[] {
  const lines = csv.split('\n');
  
  // Extract headers (first line)
  const headers = lines[0].split(',').map(header => 
    header.trim().replace(/^"(.*)"$/, '$1')
  );
  
  // Parse data rows
  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      // Handle commas inside quoted fields
      const values: string[] = [];
      let insideQuotes = false;
      let currentValue = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim().replace(/^"(.*)"$/, '$1'));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      values.push(currentValue.trim().replace(/^"(.*)"$/, '$1'));
      
      // Create object with header keys
      const record: Record<string, string> = {};
      headers.forEach((header, i) => {
        record[header] = values[i] || '';
      });
      
      return record as unknown as VC;
    });
}

export async function getVCs(): Promise<VC[]> {
  try {
    // Fetch the CSV file from the public directory
    const response = await fetch('/data/vcs.csv');
    const csvContent = await response.text();
    
    // Parse the CSV content
    const vcs = parseCSV(csvContent);
    
    // Log success
    console.log(`Successfully loaded ${vcs.length} VCs from CSV`);
    
    return vcs;
  } catch (error) {
    console.error('Error reading VC data:', error);
    console.log('Falling back to mock data');
    return getMockVCs();
  }
}

// Mock data in case the CSV parsing fails
export function getMockVCs(): VC[] {
  return [
    {
      'Investor name': 'Sequoia Capital',
      'Website': 'https://www.sequoiacap.com/',
      'Global HQ': 'Menlo Park, CA',
      'Countries of investment': 'United States, China, India, Europe',
      'Stage of investment': 'Seed, Early, Growth',
      'Investment thesis': 'Technology companies with global potential',
      'Investor type': 'Venture Capital',
      'First cheque minimum': '$50K',
      'First cheque maximum': '$1M'
    },
    {
      'Investor name': 'Y Combinator',
      'Website': 'https://www.ycombinator.com/',
      'Global HQ': 'Mountain View, CA',
      'Countries of investment': 'Global',
      'Stage of investment': 'Seed',
      'Investment thesis': 'Innovative startups with strong founding teams',
      'Investor type': 'Accelerator',
      'First cheque minimum': '$125K',
      'First cheque maximum': '$500K'
    },
    {
      'Investor name': 'Andreessen Horowitz',
      'Website': 'https://a16z.com/',
      'Global HQ': 'Menlo Park, CA',
      'Countries of investment': 'United States, Global',
      'Stage of investment': 'Seed, Early, Growth',
      'Investment thesis': 'Software eating the world',
      'Investor type': 'Venture Capital',
      'First cheque minimum': '$250K',
      'First cheque maximum': '$15M'
    },
    {
      'Investor name': 'First Round Capital',
      'Website': 'https://firstround.com/',
      'Global HQ': 'San Francisco, CA',
      'Countries of investment': 'United States',
      'Stage of investment': 'Seed',
      'Investment thesis': 'Technical founders and innovative products',
      'Investor type': 'Venture Capital',
      'First cheque minimum': '$100K',
      'First cheque maximum': '$750K'
    },
    {
      'Investor name': 'Techstars',
      'Website': 'https://www.techstars.com/',
      'Global HQ': 'Boulder, CO',
      'Countries of investment': 'Global',
      'Stage of investment': 'Pre-seed, Seed',
      'Investment thesis': 'Industry-focused acceleration programs',
      'Investor type': 'Accelerator',
      'First cheque minimum': '$20K',
      'First cheque maximum': '$120K'
    }
  ];
}

// Function to get 6 random VCs or return mock data if needed
export function getRecommendedVCs(allVCs: VC[], count: number = 6): VC[] {
  if (!allVCs || allVCs.length === 0) {
    // If using mock data, ensure we have 6 entries
    const mockData = getMockVCs();
    // If mock data has fewer than 6 entries, duplicate some to reach 6
    if (mockData.length < count) {
      const additional = [...mockData].slice(0, count - mockData.length);
      return [...mockData, ...additional];
    }
    return mockData;
  }
  
  if (allVCs.length <= count) {
    // If we have fewer than 6 VCs, duplicate some to reach 6
    const additional = [...allVCs].slice(0, count - allVCs.length);
    return [...allVCs, ...additional];
  }
  
  const shuffled = [...allVCs].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}