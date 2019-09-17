import * as mongoose from 'mongoose';

export const SocialFeedbackSchema = new mongoose.Schema(
  { //社会网络筛选指标：
    // IDegCent	Indegree Centrality
    // ODegCent	Outdegree Centrality
    // EgCent	  Eigenvector centrality
    // CloCent	Closeness centrality
    // BetCent	Betweenness centrality

    name: String,
    type: Number,
    description: String,
    evaluate: [
      {
        upper: Number,
        lower: Number,
        recommend: String,
        evaluation: String
      }
    ]
  }, { collection: 'organization', versionKey: false, timestamps: true },
);

