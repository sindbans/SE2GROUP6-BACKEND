// algorithms/RankingStrategy.js
class RankingStrategy {
    // The rank method accepts an array of events and returns the sorted array.
    rank(events) {
        throw new Error("rank() must be implemented by subclass");
    }
}

module.exports = RankingStrategy;
