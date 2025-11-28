import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test different MongoDB connection strings
    const connectionStrings = [
      `mongodb+srv://lavishstarsoft_db_user:Lavish%40AS@multivideos.e5msoiy.mongodb.net/solar_naresh?retryWrites=true&w=majority`,
      `mongodb+srv://lavishstarsoft_db_user:Lavish@AS@multivideos.e5msoiy.mongodb.net/solar_naresh?retryWrites=true&w=majority`,
      `mongodb+srv://lavishstarsoft_db_user:Lavish%2540AS@multivideos.e5msoiy.mongodb.net/solar_naresh?retryWrites=true&w=majority`
    ];

    res.status(200).json({ 
      success: true, 
      message: 'Connection test endpoint',
      env_uri: process.env.MONGODB_URI,
      env_db: process.env.MONGODB_DB,
      test_connections: connectionStrings
    });

  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}