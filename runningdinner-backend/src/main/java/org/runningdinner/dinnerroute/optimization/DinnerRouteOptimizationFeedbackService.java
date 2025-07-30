package org.runningdinner.dinnerroute.optimization;

import org.runningdinner.MailConfig;
import org.runningdinner.dinnerroute.DinnerRouteListTO;
import org.runningdinner.feedback.Feedback;
import org.runningdinner.feedback.FeedbackService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;


@Service
public class DinnerRouteOptimizationFeedbackService {

  private final FeedbackService feedbackService;
  
  private final String receiver;

	private final boolean sendFeedback;
  

  public DinnerRouteOptimizationFeedbackService(FeedbackService feedbackService,
																								MailConfig mailConfig,
																								@Value("${route.optimization.send.feedback:true}") boolean sendFeedback) {
		this.feedbackService = feedbackService;
		this.sendFeedback = sendFeedback;
		this.receiver = mailConfig.getContactMailAddress();
	}

	@Async
  @Transactional(propagation = Propagation.NOT_SUPPORTED)
	public void sendOptimizationFeedbackAsync(String adminId, DinnerRouteOptimizationResult result, Double incomingCurrentSumDistanceInMeters, Double incomingCurrentAverageDistanceInMeters) {
  	
		if (!sendFeedback) {
			return;
		}
		
  	DinnerRouteListTO optimizedDinnerRouteList = result.optimizedDinnerRouteList();

		double currentSumDistanceInMeters = incomingCurrentSumDistanceInMeters == null ? -1 : incomingCurrentSumDistanceInMeters;
		double currentAverageDistanceInMeters = incomingCurrentAverageDistanceInMeters == null ? -1 : incomingCurrentAverageDistanceInMeters;

  	Double sumNew = result.optimizedDistances().sumDistanceInMeters() == null ? -1 : result.optimizedDistances().sumDistanceInMeters();
  	Double averageNew = result.optimizedDistances().averageDistanceInMeters() == null ? -1 : result.optimizedDistances().averageDistanceInMeters();
		String newMetrics = "Sum of all distances: %.2f m, Average of all distances: %.2f m".formatted(sumNew, averageNew);
   	String currentMetrics = "Sum of all distances: %.2f m, Average of all distances: %.2f m".formatted(currentSumDistanceInMeters, currentAverageDistanceInMeters);

		String message = """
						Route Optimization calculated for %s routes.
						New route metrics are: %s
						Current route metrics are: %s
						Admin-ID: %s
						""".formatted(
							String.valueOf(optimizedDinnerRouteList.getDinnerRoutes().size()),
							newMetrics,
							currentMetrics,
							adminId
						);
  	
  	Feedback feedback = new Feedback();
  	feedback.setSenderEmail(receiver);
		feedback.setMessage(message);
  	feedback.setPageName("/hostlocations");
  	feedback.setSenderIp("SYSTEM_GENERATED");
  	feedback.setAdminId(adminId);
		feedbackService.createFeedback(feedback);
	}
  
}
